# 체감 혼잡도 계산 정책

## 1. 목적

이 문서는 리듬레이더 알파 단계에서 기종별 체감 혼잡도를 표시하는 기준을 정의합니다. 체감 혼잡도는 정확한 대기 인원이나 예상 대기 시간이 아니라, 최근 `queueLevel` 제보와 현재 가동 중인 최신 온라인 추적 대상 기체 수를 조합한 구간형 안내입니다.

이 문서는 체감 혼잡도 산정 기준 문서로 사용합니다. 다른 초안 문서의 계산 설명과 충돌하는 경우, 산정 입력과 표시 결과는 이 정책을 우선합니다.

## 2. 계산 원칙

- 계산 입력은 `queueLevel`과 `activeTrackedMachineCount`입니다.
- `activeTrackedMachineCount`는 신버전 온라인 업데이트가 유지되며 현재 플레이 가능한 추적 대상 기체 수입니다.
- `queueLevel`은 작성 후 30분 이내의 유효한 대기 상태 제보만 사용합니다.
- `totalMachineCount`, `trackedMachineCount`, `untrackedMachineCount`는 매장 정보 또는 검수 정보로 표시할 수 있지만 체감 혼잡도 산정 입력으로 사용하지 않습니다.
- 구버전, 업데이트 중단 또는 오프라인 기체처럼 신버전 온라인 추적 대상이 아닌 기체는 매장에 존재하더라도 계산에서 제외합니다.
- 알파에서 계산에 포함할 수 있는 `machineGroups[].status`는 `CURRENT_VERSION_ONLINE`뿐입니다.
- 기체의 신구 여부는 계산 포함 기준이 아닙니다. 같은 신버전이면 신기체와 구기체 모두 추적 대상이 될 수 있으며, 수요가 다르면 그룹별로 따로 계산합니다. beatmania IIDX가 대표 사례입니다.
- 결과는 정확한 대기 시간 예측이 아니라 `바로 가능`, `금방 가능`, `조금 대기`, `혼잡`, `매우 혼잡`, `정보 부족` 중 하나로 표시합니다.

## 3. 표시 단계

| 표시 문구 | 의미 |
| --- | --- |
| `바로 가능` | 이용 가능한 추적 대상 기체가 관찰되어 바로 플레이할 수 있음 |
| `금방 가능` | 현재 바로 비어 있지는 않더라도 대기 부담이 낮다고 판단됨 |
| `조금 대기` | 어느 정도 기다릴 가능성이 있으나 방문을 크게 재고할 수준은 아님 |
| `혼잡` | 방문 판단에 영향을 줄 정도의 대기가 예상됨 |
| `매우 혼잡` | 높은 대기로 인해 방문을 재고할 수 있음 |
| `정보 부족` | 유효한 최근 제보 또는 계산 가능한 가동 기체 정보가 없음 |

표시 문구는 시간 보장이 아닙니다. 예를 들어 `금방 가능`은 특정 분 이내의 플레이를 약속하지 않습니다.

## 4. 우선 처리 규칙

다음 조건은 일반 계산식보다 먼저, 표의 위에서 아래 순서로 적용합니다.

| 조건 | 표시 | 처리 이유 |
| --- | --- | --- |
| `activeTrackedMachineCount`가 `null`이거나 검수되지 않음 | `정보 부족` | 계산 가능한 가동 기체 정보가 없음 |
| `activeTrackedMachineCount`가 `0` | `플레이 불가` | 체감 혼잡도가 아니라 현재 이용 불가능 상태임 |
| 최신 대기 상태 제보가 없거나 마지막 제보가 30분을 넘겨 만료됨 | `정보 부족` | 현재 상태로 인정할 수 있는 제보가 없음 |
| `queueLevel`이 `UNKNOWN` | `정보 부족` | 유효한 최근 대기 상태가 없음 |

`플레이 불가`는 혼잡도 단계가 아니라 운영 상태 안내입니다. 구버전 또는 오프라인 기체가 남아 있더라도 최신 온라인 추적 대상 기체가 가동 중이지 않으면 이 상태를 표시합니다.
만료된 마지막 제보값은 `n분 전 제보` 참고 정보로 표시할 수 있지만 계산식에는 넣지 않습니다.

## 5. 계산식

알파에서는 `queueLevel`을 대기 압력 범위로 바꾼 뒤, 현재 가동 중인 추적 대상 기체 수로 나눠 대당 대기 압력을 계산합니다. 이 방식은 기체 수가 많은 게임의 회전량을 직접 반영합니다.

```text
대당 대기 압력 범위 = queueLevel 대기 압력 범위 / activeTrackedMachineCount
```

대기 압력은 실제 대기 인원수가 아니라 구간형 제보를 계산하기 위한 내부 기준값입니다. 정확한 인원수나 대기 시간을 의미하지 않습니다.

### queueLevel 대기 압력 범위

| `queueLevel` | 대기 압력 범위 초안 | 해석 |
| --- | ---: | --- |
| `EMPTY` | 0 | 빈 기체가 관찰됨 |
| `IN_USE_NO_QUEUE` | 0.5 이상 1 미만 | 대기열은 없지만 바로 빈 기체가 보장되지는 않음 |
| `LOW` | 1 이상 1.5 미만 | 낮은 대기 |
| `MEDIUM` | 1.5 이상 2 미만 | 보통 수준 대기 |
| `HIGH` | 2 이상 3 미만 | 높은 대기 |
| `VERY_HIGH` | 3 이상 | 매우 높은 대기 |

범위가 있는 값은 화면 표시가 과도하게 낙관적으로 나오지 않도록 상한에 가까운 값을 기준으로 판단합니다. 단, `VERY_HIGH`처럼 상한이 없는 값은 최소값인 `3`을 기준으로 계산하되, 현장 제보 품질을 보며 알파 중 조정합니다.

### 표시 구간

| 대당 대기 압력 | 표시 | 보조 설명 |
| ---: | --- | --- |
| 0 이상 0.5 미만 | `바로 가능` | 매우 쾌적 |
| 0.5 이상 1 미만 | `바로 가능` | 빈 기체 남음 |
| 1 이상 1.5 미만 | `금방 가능` | 낮은 대기 |
| 1.5 이상 2 미만 | `조금 대기` | 어느 정도 대기 |
| 2 이상 2.5 미만 | `혼잡` | 방문 판단 필요 |
| 2.5 이상 3 미만 | `매우 혼잡` | 높은 대기 |
| 3 이상 | `매우 혼잡` | 강한 혼잡 |

`바로 가능` 안에서도 0.5 미만은 매우 쾌적한 상태, 0.5 이상 1 미만은 빈 기체가 남아 있거나 금방 이용 가능한 상태로 보조 설명을 나눌 수 있습니다. 화면의 주 표시 문구는 둘 다 `바로 가능`으로 유지합니다.

기종별 수요 등급은 알파 단계에서 계산에 넣지 않습니다. 수요 등급은 화면 정렬에만 사용하고, 실제 제보가 쌓인 뒤 특정 기종에서 반복적으로 체감과 어긋나는 경우 별도 보정 정책을 검토합니다.

## 6. 계산 예시

`activeTrackedMachineCount`가 `1` 이상이고 `queueLevel`이 알려져 있을 때 다음처럼 계산합니다.

| 예시 | 계산 | 표시 |
| --- | --- | --- |
| 노스텔지어 1대, `HIGH` | 2 이상 3 미만 / 1대 = 2 이상 3 미만 | `혼잡` 또는 `매우 혼잡` |
| 사운드 볼텍스 10대, `HIGH` | 2 이상 3 미만 / 10대 = 0.2 이상 0.3 미만 | `바로 가능` |
| maimai 4대, `MEDIUM` | 1.5 이상 2 미만 / 4대 = 0.375 이상 0.5 미만 | `바로 가능` |
| IIDX 라이트닝 1대, `MEDIUM` | 1.5 이상 2 미만 / 1대 = 1.5 이상 2 미만 | `조금 대기` |
| 펌프 2대, `VERY_HIGH` | 3 이상 / 2대 = 1.5 이상 | `조금 대기` 이상 |

### 해석 원칙

- 같은 대기 상태라면 가동 중인 최신 온라인 추적 대상 기체 수가 많을수록 대기를 흡수할 여지가 있다고 봅니다.
- `queueLevel`은 범위이므로, 계산 결과가 두 표시 구간에 걸칠 수 있습니다. 이 경우 알파 초안에서는 더 혼잡한 쪽으로 표시합니다.
- `VERY_HIGH`도 기체 수로 나누되, 현장 제보상 매우 높은 대기라는 의미가 강하므로 알파 운영 중 실제 체감과 맞지 않으면 하한 표시를 별도로 둘 수 있습니다.
- 이 계산식은 알파 운영 중 실제 제보 품질과 이용자 체감에 따라 조정할 수 있습니다.

## 7. 혼재 기체 표시 원칙

최신 온라인 추적 대상 기체와 추적 제외 기체가 한 점포에 함께 있는 경우:

- `activeTrackedMachineCount`에는 가동 중인 최신 온라인 추적 대상 기체만 포함합니다.
- 기체 모델과 소프트웨어/서비스 버전은 `machineGroups`에 기록할 수 있습니다.
- 신기체와 구기체가 같은 신버전으로 운영되더라도 수요가 다르면 `machineGroups`를 나누고 각 그룹의 `queueLevel`과 가동 수로 별도 혼잡도를 표시합니다.
- 기타도라처럼 아레나 모델과 구기체 사이에 마이너 버전 차이가 있으면 알파에서는 아레나 모델만 계산에 포함하고, 구기체는 `MINOR_VERSION_DIFFERENCE` 참고 정보로 표시합니다.
- 구버전, 업데이트 중단, 오프라인 등 추적 제외 기체는 `untrackedMachineCount`에 기록할 수 있습니다.
- 오프라인 기체를 포함한 참고 정보는 `notes`에 표시할 수 있습니다.
- `untrackedMachineCount`나 `notes`의 참고 기체 수는 체감 혼잡도 계산이나 완화에 사용하지 않습니다.

예를 들어 사운드볼텍스에서 발키리 모델 1대가 최신 버전인 나블라로 가동 중이고 구기체 2대가 이전 버전인 익시드 기어로 가동 중이라면, 계산은 발키리 모델 1대만 사용합니다. 최신 기체의 상태가 `HIGH`라면 대당 대기 압력은 2 이상 3 미만으로 계산하며, 구기체 2대 때문에 낮은 혼잡도로 바꾸지 않습니다.

팝픈뮤직처럼 신기체에만 신버전이 선행 적용되는 기간에는 신버전 신기체 그룹만 해당 신버전 대기열 계산에 포함합니다. 구기체가 이전 온라인 버전을 가동 중이면 매장 참고 정보로 표시하되, 신버전 체감 혼잡도에는 포함하지 않습니다.

## 8. 수요 및 표시 우선순위

알파 단계에서는 기종별 실제 플레이어 수와 화면 표시 우선순위를 같은 기본 등급으로 둡니다. 이 등급은 정확한 방문자 수 예측이 아니라, 점포 상세 화면에서 자주 확인할 가능성이 높은 기종을 위로 올리기 위한 정책값입니다.

| 등급 | 의미 | 적용 기종 초안 |
| --- | --- | --- |
| `PINNED_TOP` | 항상 최상단에 고정하며 수요가 가장 높다고 보는 기종 | 사운드 볼텍스, maimai |
| `HIGH` | 최상단 바로 아래에 두는 높은 수요 기종 | beatmania IIDX 라이트닝 모델 |
| `MEDIUM` | 기본 표시 및 기본 수요 기종 | beatmania IIDX 디럭스 모델, CHUNITHM, 팝픈뮤직 신기체 |
| `LOWER_MEDIUM` | 기본보다 약간 낮지만 하단 고정은 아닌 기종 | DDR, 펌프 잇 업 |
| `MEDIUM_LOW` | 기본보다 낮은 표시 및 수요 기종 | GITADORA, 유비트, 태고의 달인, DANCERUSH STARDOM |
| `PINNED_BOTTOM` | 항상 하단에 고정하는 낮은 수요 기종 | 노스텔지어 |

정렬 원칙:

- `PINNED_TOP`은 점포 상세의 최상단에 고정합니다.
- `PINNED_BOTTOM`은 점포 상세의 최하단에 고정합니다.
- 같은 등급 안에서는 정적 데이터 입력 순서를 유지합니다.
- beatmania IIDX처럼 같은 게임 안에서 라이트닝 모델과 디럭스 모델의 수요가 다르면 `machineGroups` 단위 우선순위를 둘 수 있습니다.
- 사운드 볼텍스처럼 최신 버전 그룹과 구버전 참고 그룹이 함께 있으면, 추적 대상인 최신 버전 그룹의 등급만 목록 정렬에 사용합니다.

기종별 수요 등급은 알파 단계에서 혼잡도 단계 가산 또는 감산에 사용하지 않습니다. 우선은 높은 수요 등급의 기종이 같은 `queueLevel`과 같은 가동 기체 수를 가질 때 더 위에 보이도록 정렬에만 반영하고, 실제 제보가 쌓인 뒤 혼잡도 단계 보정 여부를 검토합니다.

점포 전체 혼잡도는 알파 단계에서 계산하지 않습니다. 화면에는 기종별 혼잡도와 최근 제보 여부만 표시합니다.

## 9. TypeScript 초안

아래 코드는 향후 화면 구현 시 사용할 수 있는 순수 계산 함수 제안입니다. 현재 단계에서는 문서상의 계약이며 실제 기능 파일, 로그인, DB, 백엔드 또는 제보 저장 로직을 추가하지 않습니다.

```ts
type DemandPriority =
  | "PINNED_TOP"
  | "HIGH"
  | "MEDIUM"
  | "LOWER_MEDIUM"
  | "MEDIUM_LOW"
  | "PINNED_BOTTOM";

type QueueLevel =
  | "EMPTY"
  | "IN_USE_NO_QUEUE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY_HIGH"
  | "UNKNOWN";

type CrowdLevel =
  | "AVAILABLE_NOW"
  | "AVAILABLE_SOON"
  | "SHORT_WAIT"
  | "CROWDED"
  | "VERY_CROWDED"
  | "INSUFFICIENT_INFO"
  | "UNAVAILABLE";

const CROWD_LEVEL_LABELS: Record<CrowdLevel, string> = {
  AVAILABLE_NOW: "바로 가능",
  AVAILABLE_SOON: "금방 가능",
  SHORT_WAIT: "조금 대기",
  CROWDED: "혼잡",
  VERY_CROWDED: "매우 혼잡",
  INSUFFICIENT_INFO: "정보 부족",
  UNAVAILABLE: "플레이 불가",
};

type CrowdLevelResult = {
  level: CrowdLevel;
  pressureMin: number | null;
  pressureMax: number | null;
  description?: string;
};

function calculateCrowdLevel(
  queueLevel: QueueLevel,
  activeTrackedMachineCount: number | null,
  isReportFresh: boolean,
): CrowdLevelResult {
  if (activeTrackedMachineCount === null) {
    return { level: "INSUFFICIENT_INFO", pressureMin: null, pressureMax: null };
  }

  if (activeTrackedMachineCount <= 0) {
    return { level: "UNAVAILABLE", pressureMin: null, pressureMax: null };
  }

  if (!isReportFresh) {
    return { level: "INSUFFICIENT_INFO", pressureMin: null, pressureMax: null };
  }

  if (queueLevel === "UNKNOWN") {
    return { level: "INSUFFICIENT_INFO", pressureMin: null, pressureMax: null };
  }

  const queuePressureRange = {
    EMPTY: [0, 0],
    IN_USE_NO_QUEUE: [0.5, 1],
    LOW: [1, 1.5],
    MEDIUM: [1.5, 2],
    HIGH: [2, 3],
    VERY_HIGH: [3, null],
  } as const;

  const [min, max] = queuePressureRange[queueLevel];
  const pressureMin = min / activeTrackedMachineCount;
  const pressureMax =
    max === null ? null : max / activeTrackedMachineCount;

  // 범위가 두 표시 구간에 걸치면 과소 표시를 피하기 위해 상한을 기준으로 판단합니다.
  const decisionPressure =
    pressureMax === null
      ? pressureMin
      : Math.max(pressureMin, pressureMax - Number.EPSILON);

  if (decisionPressure < 0.5) {
    return {
      level: "AVAILABLE_NOW",
      pressureMin,
      pressureMax,
      description: "매우 쾌적",
    };
  }

  if (decisionPressure < 1) {
    return {
      level: "AVAILABLE_NOW",
      pressureMin,
      pressureMax,
      description: "빈 기체 남음",
    };
  }

  if (decisionPressure < 1.5) {
    return { level: "AVAILABLE_SOON", pressureMin, pressureMax };
  }

  if (decisionPressure < 2) {
    return { level: "SHORT_WAIT", pressureMin, pressureMax };
  }

  if (decisionPressure < 2.5) {
    return { level: "CROWDED", pressureMin, pressureMax };
  }

  return { level: "VERY_CROWDED", pressureMin, pressureMax };
}
```

`isReportFresh`는 마지막 제보가 30분 이내인지 나타내는 값입니다. 계산식은 알파 운영 중 실제 체감과 맞지 않는 사례가 쌓이면 조정합니다.
