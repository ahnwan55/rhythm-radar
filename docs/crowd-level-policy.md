# 체감 혼잡도 계산 정책

## 1. 목적

이 문서는 리듬레이더 알파 단계에서 기종별 체감 혼잡도를 표시하는 기준을 정의합니다. 체감 혼잡도는 정확한 대기 인원이나 예상 대기 시간이 아니라, 최근 `queueLevel` 제보와 현재 가동 중인 최신 온라인 추적 대상 기체 수를 조합한 구간형 안내입니다.

이 문서는 체감 혼잡도 산정 기준 문서로 사용합니다. 다른 초안 문서의 계산 설명과 충돌하는 경우, 산정 입력과 표시 결과는 이 정책을 우선합니다.

## 2. 계산 원칙

- 계산 입력은 `queueLevel`과 `activeTrackedMachineCount`입니다.
- `activeTrackedMachineCount`는 신버전 온라인 업데이트가 유지되며 현재 플레이 가능한 추적 대상 기체 수입니다.
- `totalMachineCount`, `trackedMachineCount`, `untrackedMachineCount`는 매장 정보 또는 검수 정보로 표시할 수 있지만 체감 혼잡도 산정 입력으로 사용하지 않습니다.
- 구버전, 업데이트 중단 또는 오프라인 기체처럼 신버전 온라인 추적 대상이 아닌 기체는 매장에 존재하더라도 계산에서 제외합니다.
- 기체의 신구 여부는 계산 포함 기준이 아닙니다. 같은 신버전이면 신기체와 구기체 모두 추적 대상이 될 수 있으며, 수요가 다르면 그룹별로 따로 계산합니다. 기타도라와 beatmania IIDX가 대표 사례입니다.
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

다음 조건은 일반 조합표보다 먼저, 표의 위에서 아래 순서로 적용합니다.

| 조건 | 표시 | 처리 이유 |
| --- | --- | --- |
| `activeTrackedMachineCount`가 `null`이거나 검수되지 않음 | `정보 부족` | 계산 가능한 가동 기체 정보가 없음 |
| `activeTrackedMachineCount`가 `0` | `플레이 불가` | 체감 혼잡도가 아니라 현재 이용 불가능 상태임 |
| `queueLevel`이 `UNKNOWN` | `정보 부족` | 유효한 최근 대기 상태가 없음 |

`플레이 불가`는 혼잡도 단계가 아니라 운영 상태 안내입니다. 구버전 또는 오프라인 기체가 남아 있더라도 최신 온라인 추적 대상 기체가 가동 중이지 않으면 이 상태를 표시합니다.

## 5. 조합표

`activeTrackedMachineCount`가 `1` 이상이고 `queueLevel`이 알려져 있을 때 다음 표를 적용합니다.

| `queueLevel` | 가동 추적 기체 1대 | 가동 추적 기체 2대 | 가동 추적 기체 3대 이상 |
| --- | --- | --- | --- |
| `EMPTY` | `바로 가능` | `바로 가능` | `바로 가능` |
| `IN_USE_NO_QUEUE` | `금방 가능` | `금방 가능` | `금방 가능` |
| `LOW` | `조금 대기` | `금방 가능` | `금방 가능` |
| `MEDIUM` | `혼잡` | `조금 대기` | `조금 대기` |
| `HIGH` | `매우 혼잡` | `혼잡` | `혼잡` |
| `VERY_HIGH` | `매우 혼잡` | `매우 혼잡` | `매우 혼잡` |

### 해석 원칙

- `EMPTY`는 가동 중 추적 대상 기체 중 빈 기체가 있다는 제보이므로 기체 수와 관계없이 `바로 가능`입니다.
- 같은 대기 상태라면 가동 중인 최신 온라인 추적 대상 기체 수가 많을수록 대기를 흡수할 여지가 있다고 봅니다.
- `VERY_HIGH`는 기체 수가 많더라도 높은 대기가 관찰된 상태이므로 완화하지 않습니다.
- 이 표는 알파 운영 중 실제 제보 품질과 이용자 체감에 따라 조정할 수 있습니다.

## 6. 혼재 기체 표시 원칙

최신 온라인 추적 대상 기체와 추적 제외 기체가 한 점포에 함께 있는 경우:

- `activeTrackedMachineCount`에는 가동 중인 최신 온라인 추적 대상 기체만 포함합니다.
- 기체 모델과 소프트웨어/서비스 버전은 `machineGroups`에 기록할 수 있습니다.
- 신기체와 구기체가 같은 신버전으로 운영되더라도 수요가 다르면 `machineGroups`를 나누고 각 그룹의 `queueLevel`과 가동 수로 별도 혼잡도를 표시합니다.
- 구버전, 업데이트 중단, 오프라인 등 추적 제외 기체는 `untrackedMachineCount`에 기록할 수 있습니다.
- 오프라인 기체를 포함한 참고 정보는 `notes`에 표시할 수 있습니다.
- `untrackedMachineCount`나 `notes`의 참고 기체 수는 조합표 적용이나 체감 혼잡도 완화에 사용하지 않습니다.

예를 들어 사운드볼텍스에서 발키리 모델 1대가 최신 버전인 나블라로 가동 중이고 구기체 2대가 이전 버전인 익시드 기어로 가동 중이라면, 계산은 발키리 모델 1대만 사용합니다. 최신 기체의 상태가 `HIGH`라면 1대 열의 `매우 혼잡`을 사용하며, 구기체 2대 때문에 낮은 혼잡도로 바꾸지 않습니다.

팝픈뮤직처럼 신기체에만 신버전이 선행 적용되는 기간에는 신버전 신기체 그룹만 해당 신버전 대기열 계산에 포함합니다. 구기체가 이전 온라인 버전을 가동 중이면 매장 참고 정보로 표시하되, 신버전 체감 혼잡도에는 포함하지 않습니다.

## 7. TypeScript 초안

아래 코드는 향후 화면 구현 시 사용할 수 있는 순수 계산 함수 제안입니다. 현재 단계에서는 문서상의 계약이며 실제 기능 파일, 로그인, DB, 백엔드 또는 제보 저장 로직을 추가하지 않습니다.

```ts
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

function calculateCrowdLevel(
  queueLevel: QueueLevel,
  activeTrackedMachineCount: number | null,
): CrowdLevel {
  if (activeTrackedMachineCount === null) {
    return "INSUFFICIENT_INFO";
  }

  if (activeTrackedMachineCount <= 0) {
    return "UNAVAILABLE";
  }

  if (queueLevel === "UNKNOWN") {
    return "INSUFFICIENT_INFO";
  }

  if (queueLevel === "EMPTY") {
    return "AVAILABLE_NOW";
  }

  if (queueLevel === "IN_USE_NO_QUEUE") {
    return "AVAILABLE_SOON";
  }

  const machineBucket = activeTrackedMachineCount === 1 ? 1 : 2;

  const resultByQueueLevel = {
    LOW: machineBucket === 1 ? "SHORT_WAIT" : "AVAILABLE_SOON",
    MEDIUM: machineBucket === 1 ? "CROWDED" : "SHORT_WAIT",
    HIGH: machineBucket === 1 ? "VERY_CROWDED" : "CROWDED",
    VERY_HIGH: "VERY_CROWDED",
  } as const;

  return resultByQueueLevel[queueLevel];
}
```

기체가 2대인 경우와 3대 이상인 경우는 현재 조합표에서 동일하게 처리합니다. 추후 알파 데이터에서 차이가 확인될 때에만 추가 구간을 함수에 도입합니다.
