# 개념 데이터 모델

## 1. 문서 범위

이 문서는 알파테스트 정책을 뒷받침하는 개념 데이터 모델 초안입니다. 특정 데이터베이스, API, 인증 방식 또는 구현 기술을 확정하지 않습니다.

## 2. 모델링 원칙

- 대기 상태는 사람 수가 아니라 구간형 상태로 저장합니다.
- 사용자 제보 원본과 현재 화면에 노출할 최신 상태를 구분합니다.
- 전체 기체 수와 대기열 추적 대상 기체 수는 관리자 승인된 값만 기준 정보로 사용합니다.
- 대기열과 체감 혼잡도에는 최신 온라인 업데이트가 유지되는 신버전만 포함하며, 기체의 신구 여부 자체는 추적 포함 기준으로 사용하지 않습니다.
- 신기체와 구기체가 같은 신버전을 가동하더라도 수요가 다를 수 있으면 `MachineGroup`으로 분리해 표시할 수 있습니다.
- 기타도라처럼 신기체와 구기체 사이에 마이너 버전 차이가 있으면 알파에서는 최신 버전이 확인된 아레나 모델만 추적하고, 구기체는 참고 정보로 분리합니다.
- 증거 사진이 필요한 기기 정보 변경 제보와 사진 없이 즉시 반영되는 대기 상태 제보를 분리합니다.
- 체감 혼잡도는 저장 가능한 입력 데이터에서 계산되는 파생값으로 취급합니다.
- 악성 사용 대응을 위해 제보 작성자, 시각, 신고, 관리자 검토 결과를 추적할 수 있어야 합니다.
- 화면 설계 단계에서는 `src/data/alphaStores.ts`의 정적 데이터 구조로 동일한 필드를 먼저 표현합니다.

## 3. 핵심 엔터티

### `User`

로그인하여 제보하거나 관리 작업을 수행하는 이용자입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 사용자 식별자 |
| `auth_provider` | 알파에서는 `KAKAO` |
| `provider_user_id` | 카카오 계정에서 받은 외부 식별자 |
| `role` | `USER` 또는 `ADMIN` |
| `status` | 활성/제한 상태를 위한 값. 알파에서 수동 운영용으로만 고려 |
| `created_at` | 가입 시각 |

알파 로그인 제공자는 카카오로 고정합니다. 관리자는 초기 알파에서 운영자 1명만 두며, 구현 시 관리자 계정에 `ADMIN` 역할을 부여할 수 있어야 합니다.

### `Store`

대기 상태를 제공하는 오락실 점포입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 점포 식별자 |
| `name` | 표시 점포명 |
| `region` | 서울, 경기, 인천 등 권역 |
| `location_text` | 주소 또는 위치 안내 |
| `registration_type` | `STANDARD` 또는 `EXCEPTION` |
| `status` | `ACTIVE`, `PENDING_VERIFICATION`, `PLANNED_ALPHA_2`, `HIDDEN` 등 공개 상태 |
| `reviewed_at` | 최근 관리자 검수 시각 |

### `GameTitle`

대기 상태를 분리해 표시할 리듬게임 기종 또는 모델입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 기종 식별자 |
| `name` | 표시 이름 |
| `series` | BEMANI 등 계열 구분 |
| `model` | 게임 타이틀 또는 주요 모델 이름. 기체 모델과 혼동하지 않도록 상세 기체 정보는 `MachineGroup`에 기록 |
| `online_service_status` | 해당 타이틀의 최신 온라인 업데이트 상태 |

### `StoreGame`

특정 점포에서 제공하는 기종과 검수된 기체 수 집계를 나타냅니다. 최신 온라인 신버전 추적 대상이 존재할 때 대기 상태 제보의 기본 단위가 됩니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 점포-기종 식별자 |
| `store_id` | 점포 참조 |
| `game_title_id` | 기종 참조 |
| `total_machine_count` | 물리적으로 존재하는 관리자 승인 전체 기체 수 |
| `tracked_machine_count` | 최신 온라인 업데이트가 유지되는 신버전 추적 대상 기체 수 |
| `active_tracked_machine_count` | 현재 가동 중인 신버전 추적 대상 기체 수 |
| `untracked_machine_count` | 구버전, 업데이트 중단, 오프라인 등으로 계산에서 제외하는 기체 수 |
| `machine_count_reviewed_at` | 기체 수 최근 승인 시각 |
| `status` | 제보 허용 여부를 포함한 운영 상태 |

오프라인 기체는 `total_machine_count`에는 포함할 수 있으나 `tracked_machine_count`와 `active_tracked_machine_count`에는 포함하지 않습니다. 추적 제외 기체가 최신 온라인 추적 대상 기체와 혼재하면 `untracked_machine_count`와 화면의 `notes`에 참고 정보로 기록합니다.

### `MachineGroup`

같은 기종 안에서 기체 모델과 소프트웨어/서비스 버전이 나뉘는 경우를 기록하는 검수 단위입니다. 추적 포함 여부는 오직 소프트웨어/서비스 버전이 최신 온라인 업데이트 대상인지로 판단합니다. 기체가 신형인지 구형인지는 추적 포함 기준이 아니며, 이용자 수요가 다를 때 화면을 분리하기 위한 표시 기준입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 기체/버전 그룹 식별자 |
| `store_game_id` | 점포-기종 참조 |
| `cabinet_model` | 발키리 모델, 구기체 등 기체 모델 또는 현장 식별명 |
| `software_version` | 사운드볼텍스 나블라, 익시드 기어 등 가동 버전 |
| `machine_count` | 해당 그룹의 물리 기체 수 |
| `active_machine_count` | 해당 그룹에서 현재 가동 중인 기체 수 |
| `service_status` | `CURRENT_VERSION_ONLINE`, `MINOR_VERSION_DIFFERENCE`, `OLD_VERSION_OR_UPDATE_ENDED`, `OFFLINE`, `UNKNOWN` |
| `is_queue_tracked` | 대기열과 체감 혼잡도 계산에 포함하는지 여부 |
| `queue_level` | 해당 그룹의 대기 상태. 그룹별 수요가 다르면 별도로 제보 받음 |
| `last_reported_at` | 해당 그룹의 최근 제보 시각 |
| `note` | 검수 메모 |

#### `service_status` 판정 기준

| 상태 | 의미 | 알파 계산 포함 |
| --- | --- | --- |
| `CURRENT_VERSION_ONLINE` | 리듬레이더가 추적하려는 최신 온라인 버전이며 현장에서 플레이 가능한 상태 | 포함 가능 |
| `MINOR_VERSION_DIFFERENCE` | 온라인 플레이는 가능하지만 추적 기준 최신 버전 또는 대표 모델과 마이너 버전 차이가 있어 같은 대기열로 묶기 애매한 상태 | 제외 |
| `OLD_VERSION_OR_UPDATE_ENDED` | 명확히 이전 버전이거나 최신 업데이트 대상이 아닌 상태 | 제외 |
| `OFFLINE` | 전원 꺼짐, 고장, 네트워크 불가, 장기 미가동 등으로 플레이할 수 없는 상태 | 제외 |
| `UNKNOWN` | 현장에서 버전 또는 가동 상태를 확정하지 못한 상태 | 제외 |

알파 단계에서 `is_queue_tracked = true`가 될 수 있는 상태는 `CURRENT_VERSION_ONLINE`뿐입니다. 최신 버전 기체가 일시적으로 미가동이면 `tracked_machine_count`에는 남길 수 있으나 `active_tracked_machine_count`에서는 제외합니다. 구버전 또는 참고 기체가 미가동이면 `untracked_machine_count`에는 포함하고 해당 `MachineGroup.active_machine_count`만 줄입니다.

예를 들어 사운드볼텍스에서 발키리 모델이 최신 버전인 나블라를 가동하면 `is_queue_tracked = true`로 기록합니다. 구기체가 이전 버전인 익시드 기어를 가동하면 매장 참고 정보로 남길 수 있지만 `is_queue_tracked = false`로 기록합니다. 반대로 beatmania IIDX처럼 신기체와 구기체가 모두 같은 최신 온라인 버전을 지원하는 경우에는 둘 다 `is_queue_tracked = true`가 될 수 있으며, 수요가 다르면 서로 다른 `MachineGroup`으로 분리합니다. 기타도라처럼 아레나 모델과 구기체 사이에 마이너 버전 차이가 있으면 알파 단계에서는 아레나 모델만 추적 대상이 되고, 구기체는 `MINOR_VERSION_DIFFERENCE` 참고 정보로 기록합니다. 팝픈뮤직처럼 신기체에만 신버전이 선행 적용되는 기간에는 신버전 신기체 그룹만 추적 대상이 되고, 이전 버전을 가동하는 구기체 그룹은 해당 신버전 대기열 계산에서 제외합니다.

### `AlphaStore` / `AlphaGame`

화면 프로토타입에서 바로 읽을 수 있는 정적 데이터 표현입니다. 실제 저장 모델을 대체하지 않으며, 검수 전 기종을 추정하여 추가하지 않습니다.

| 타입 | 필드 |
| --- | --- |
| `AlphaStore` | `id`, `name`, `region`, `area`, `status`, `notes`, `games` |
| `AlphaGame` | `title`, `totalMachineCount`, `trackedMachineCount`, `activeTrackedMachineCount`, `untrackedMachineCount`, `machineGroups`, `queueLevel`, `lastReportedAt`, `lastVerifiedAt` |

`AlphaGame.queueLevel`은 기종 단위 요약 또는 단일 추적 그룹의 표시값입니다. 같은 기종 안에서 신기체/구기체 등 수요가 다른 추적 그룹을 분리할 때는 `machineGroups[].queueLevel`과 `machineGroups[].activeMachineCount`를 우선 사용합니다.

향후 화면 구현에서는 기종별 수요와 표시 순서를 위해 `demandPriority` 같은 필드를 `AlphaGame` 또는 `AlphaMachineGroup`에 둘 수 있습니다. 알파 정책 초안의 등급은 `PINNED_TOP`, `HIGH`, `MEDIUM`, `LOWER_MEDIUM`, `MEDIUM_LOW`, `PINNED_BOTTOM`이며, 정확한 기준은 [crowd-level-policy.md](crowd-level-policy.md)를 따릅니다.

초기 `alphaStores` 데이터는 알파 1차 점포 5곳과 알파 2차 예정 점포 1곳을 포함합니다. 기종 검수 전에는 각 점포의 `games`를 빈 배열로 유지하며, `PLANNED_ALPHA_2` 상태인 점포는 알파 1차 검수 완료 조건에 포함하지 않습니다.

### `WaitReport`

로그인 이용자가 남긴 기종별 대기 상태 제보 원본입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 제보 식별자 |
| `store_game_id` | 제보 대상 점포-기종 |
| `machine_group_id` | 수요가 분리되는 기체/버전 그룹 대상. 기종 단위 제보면 비워둘 수 있음 |
| `reporter_user_id` | 작성 이용자 |
| `queue_level` | `EMPTY`, `IN_USE_NO_QUEUE`, `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`, `UNKNOWN` |
| `created_at` | 제보 시각 |
| `expires_at` | 최신 상태로 인정되는 만료 시각 |
| `moderation_status` | 운영 검토가 필요한 경우의 상태 |

`expires_at`은 알파 단계에서 `created_at + 30분`으로 계산합니다. `UNKNOWN`은 정적 화면 데이터와 최신 상태 표시에만 사용할 수 있으며, 실제 제보 입력 화면에서 이용자가 직접 선택할 수 없습니다. 대기 상태 제보에는 사진을 첨부하지 않습니다.

만료된 `WaitReport`는 최신 상태 계산에서는 제외하지만, 마지막 제보값과 시각을 `n분 전 제보` 참고 정보로 보여 주기 위해 이력으로 보관할 수 있습니다.

`moderation_status`는 알파에서 `VISIBLE`, `REPORTED`, `HIDDEN` 정도로 시작합니다. `REPORTED`는 관리자 확인이 필요하다는 뜻이며, 자동으로 최신 상태 계산에서 제외하지 않습니다. `HIDDEN`은 관리자가 이상 제보로 판단해 최신 상태 계산에서 제외한 상태입니다.

### `Report`

로그인 이용자가 이상하다고 판단한 대기 상태 제보를 관리자에게 알리는 신고 원본입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 신고 식별자 |
| `target_wait_report_id` | 신고 대상 `WaitReport` |
| `reporter_user_id` | 신고 작성 이용자 |
| `reason` | `WRONG_QUEUE_LEVEL`, `SPAM_OR_TROLLING`, `WRONG_TARGET`, `OTHER` |
| `description` | 선택 입력 설명 |
| `status` | `PENDING`, `RESOLVED`, `REJECTED` |
| `reviewed_by` | 처리 관리자 |
| `reviewed_at` | 처리 시각 |
| `created_at` | 신고 시각 |

### `MachineChangeReport`

기기 고장, 수리 완료, 증설 또는 철수처럼 관리자 승인이 필요한 이용자 제보입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 변경 제보 식별자 |
| `store_game_id` | 변경 대상 점포-기종 |
| `reporter_user_id` | 작성 이용자 |
| `change_type` | `BROKEN`, `REPAIRED`, `ADDED`, `REMOVED`, `OTHER` |
| `description` | 제보 설명 |
| `evidence_photos` | 하나 이상의 `EvidencePhoto` 참조 |
| `review_status` | `PENDING`, `APPROVED`, `REJECTED` |
| `reviewed_by` | 처리 관리자 |
| `reviewed_at` | 처리 시각 |
| `created_at` | 접수 시각 |

### `EvidencePhoto`

기기 정보 변경 제보에 첨부되는 검수 자료입니다. 일반 대기 상태 제보에는 사진을 연결하지 않습니다. 사진 자체의 저장 방식은 정하지 않되, 보관과 삭제 정책을 적용할 수 있는 별도 개념으로 둡니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 사진 식별자 |
| `uploader_user_id` | 업로드 이용자 |
| `storage_reference` | 저장소 내 파일 참조 |
| `created_at` | 업로드 시각 |
| `retention_until` | 보관 만료 시각 |
| `privacy_review_status` | 개인정보 노출 검토 상태 |

알파 기본 보관 기간은 접수 시점 기준 2주입니다. `retention_until`이 지나면 자동 삭제 대상이 됩니다. 기체 수, 버전, 가동 상태처럼 공개 기준값에 영향을 주는 중요 정보에만 사진을 요구하며, 사진은 공개 화면에 노출하지 않고 관리자만 열람합니다.

### `MachineCountRevision`

관리자가 승인한 기체 수 변경 이력입니다.

| 필드 | 설명 |
| --- | --- |
| `id` | 변경 이력 식별자 |
| `store_game_id` | 변경된 점포-기종 |
| `total_machine_count` | 승인 후 물리적 전체 기체 수 |
| `tracked_machine_count` | 승인 후 대기열 추적 대상인 최신 온라인 기체 수 |
| `active_tracked_machine_count` | 승인 후 현재 가동 중인 추적 대상 기체 수 |
| `untracked_machine_count` | 승인 후 계산에서 제외하는 기체 수 |
| `source_report_id` | 근거가 된 변경 제보 참조, 직접 검수 시 비어 있을 수 있음 |
| `approved_by` | 승인 관리자 |
| `approved_at` | 승인 시각 |
| `note` | 검수 메모 |

## 4. 관계 요약

| 관계 | 설명 |
| --- | --- |
| `Store` 1:N `StoreGame` | 점포는 여러 기종을 운영할 수 있음 |
| `GameTitle` 1:N `StoreGame` | 동일 기종은 여러 점포에 존재할 수 있음 |
| `StoreGame` 1:N `WaitReport` | 기종별 대기 상태 제보 이력을 보관 |
| `WaitReport` 1:N `Report` | 특정 대기 상태 제보에 대한 신고 이력을 보관 |
| `StoreGame` 1:N `MachineGroup` | 기체 모델과 소프트웨어/서비스 버전별 검수 정보를 보관 |
| `StoreGame` 1:N `MachineChangeReport` | 기기 변화 제보 이력을 보관 |
| `StoreGame` 1:N `MachineCountRevision` | 승인된 기기 수 변경 이력을 보관 |
| `MachineChangeReport` 1:N `EvidencePhoto` | 변경 제보에는 하나 이상의 증거 사진을 연결할 수 있음 |
| `User` 1:N 각 제보/승인 기록 | 책임 추적과 운영 검토에 사용 |

## 5. 최신 대기 상태 선택 규칙 초안

1. `StoreGame`에 대해 작성 후 30분이 지나지 않은 대기 상태 제보를 찾습니다.
2. `moderation_status = HIDDEN`처럼 운영상 제외된 제보는 최신 상태 후보에서 제거합니다.
3. 가장 최근의 유효 제보를 화면 표시 상태로 사용합니다.
4. 유효 제보가 없으면 `UNKNOWN` 및 `확인 필요`를 표시하고, 체감 혼잡도는 `정보 부족`으로 처리합니다.
5. 만료된 마지막 제보가 있으면 상태 계산에는 쓰지 않되, `n분 전 제보` 형식으로 마지막 제보 시각을 보조 정보로 표시할 수 있습니다. 이 보조 정보는 화면에서 회색 계열의 낮은 대비 텍스트로 표시합니다.
6. 화면에는 상태와 함께 마지막 제보 시각을 표시합니다.

알파에서는 복수 제보 다수결이나 사용자 신뢰도 가중치는 적용하지 않습니다.

## 6. 체감 혼잡도 계산 초안

체감 혼잡도는 `StoreGame` 또는 분리된 `MachineGroup` 단위로 표시합니다. 알파 단계에서는 점포 전체 혼잡도 요약을 계산하지 않습니다. 최종 산정 기준과 표시 문구는 [crowd-level-policy.md](crowd-level-policy.md)를 우선합니다.

### 입력

| 입력 | 출처 |
| --- | --- |
| 최신 대기 상태 | 작성 후 30분 이내의 최신 유효 `WaitReport` |
| 가동 중 추적 대상 기체 수 | 승인된 `StoreGame.active_tracked_machine_count` 또는 분리 표시 시 `MachineGroup.active_machine_count` |

`tracked_machine_count`는 검수 맥락과 가동 감소 안내에 사용할 수 있으나, 알파 체감 혼잡도 계산의 직접 입력은 `active_tracked_machine_count`입니다. `total_machine_count`와 `untracked_machine_count`는 상세 화면의 매장 참고 정보로 표시할 수 있으나, 대기열 및 체감 혼잡도 계산 입력에는 사용하지 않습니다. 오프라인 기체도 동일하게 계산에서 제외합니다.

### 대기 상태 기본 순서

| 대기 상태 | 혼잡 방향 |
| --- | --- |
| `EMPTY` | 가장 낮음 |
| `IN_USE_NO_QUEUE` | 낮음 |
| `LOW` | 낮음에서 보통 |
| `MEDIUM` | 보통 |
| `HIGH` | 높음 |
| `VERY_HIGH` | 가장 높음 |
| `UNKNOWN` | 계산하지 않음 |

### 가동 중 추적 대상 기체 수 반영

현재 가동 중인 추적 대상 기체 수가 적으면 이용 가능한 회전량이 감소하므로 같은 대기 상태라도 더 높은 체감 혼잡도로 표시할 수 있습니다. 알파 계산식은 `queue_level`을 대기 압력 범위로 바꾼 뒤 `active_tracked_machine_count`로 나눠 대당 대기 압력을 계산합니다.

| 조건 | 처리 |
| --- | --- |
| `active_tracked_machine_count`가 `null` | `정보 부족` |
| `active_tracked_machine_count`가 `0` | `플레이 불가` |
| `active_tracked_machine_count`가 `1` 이상이고 유효 제보가 있음 | [crowd-level-policy.md](crowd-level-policy.md)의 계산식 적용 |

### 표시 단계

| 상태 | 표시 |
| --- | --- |
| 즉시 가능성이 높음 | `바로 가능` |
| 낮은 대기 | `금방 가능` |
| 약간의 대기 | `조금 대기` |
| 방문 판단 필요 | `혼잡` |
| 강한 주의 필요 | `매우 혼잡` |
| 유효 제보 없음 또는 계산 불가 | `정보 부족` |
| 가동 중인 추적 대상 기체 없음 | `플레이 불가` |

기종별 수요 등급은 알파 단계에서 화면 정렬에만 사용하고, 혼잡도 단계 가산 또는 감산에는 사용하지 않습니다.

## 7. 무결성 규칙 초안

| 대상 | 규칙 | 위반 시 처리 초안 |
| --- | --- | --- |
| `StoreGame` | `0 <= active_tracked_machine_count <= tracked_machine_count <= total_machine_count` | 관리자 저장 거부 |
| `StoreGame` | `0 <= untracked_machine_count <= total_machine_count` 및 `tracked_machine_count + untracked_machine_count <= total_machine_count` | 관리자 저장 거부 |
| `MachineGroup` | `service_status = CURRENT_VERSION_ONLINE`인 그룹만 `is_queue_tracked = true` 가능 | 관리자 저장 거부 |
| `MachineGroup` | `service_status = MINOR_VERSION_DIFFERENCE`인 그룹은 알파 단계에서 `is_queue_tracked = false`로 둠 | 관리자 저장 거부 |
| `MachineGroup` | `is_queue_tracked = true`인 그룹만 `tracked_machine_count`와 `active_tracked_machine_count` 집계에 포함 | 관리자 저장 거부 |
| `WaitReport` | `queue_level`은 정의된 상태 중 `UNKNOWN`을 제외한 6개 이용자 입력값만 저장 가능 | 제보 제출 거부 |
| `WaitReport` | 작성자는 로그인 이용자여야 함 | 로그인 유도 |
| `WaitReport` | 동일 이용자의 동일 `StoreGame` 제보는 직전 제보 후 3분이 지나야 작성 가능 | 남은 시간 안내 |
| `WaitReport` | 다른 이용자라도 동일 `StoreGame`의 직전 제보 후 1분이 지나야 작성 가능 | 남은 시간 안내 |
| `WaitReport` | `expires_at = created_at + 30분` | 서버 계산값으로 저장 |
| `WaitReport` | 일반 대기 상태 제보에는 사진을 연결하지 않음 | 사진 업로드 거부 |
| `Report` | 작성자는 로그인 이용자여야 함 | 로그인 유도 |
| `Report` | 같은 이용자의 같은 `WaitReport` 반복 신고는 1건만 허용 | 중복 신고 거부 |
| `Report` | 신고 접수만으로 대상 `WaitReport`를 숨기지 않음 | 관리자 검토 대기 |
| `MachineChangeReport` | 제출 시 증거 사진이 최소 1개 필요 | 접수 거부 |
| `EvidencePhoto` | `retention_until = created_at + 14일` | 자동 삭제 예약 |
| `MachineCountRevision` | 승인 또는 관리자 직접 검수 근거가 필요 | 공개값 변경 거부 |

대기 상태 제보 쿨타임은 동일 이용자의 같은 `StoreGame` 반복 제보 3분, 서로 다른 이용자의 같은 `StoreGame` 연속 제보 1분으로 고정합니다. 두 값은 제보 갱신 단위이며, 최신 제보 유효 시간 30분과는 별도입니다. 증거 사진은 기기 정보 변경 검수에만 사용하고 접수 시점 기준 2주 뒤 자동 삭제합니다.

## 8. 상태 전이 초안

### 기기 변경 제보

| 현재 상태 | 동작 | 다음 상태 | 공개 기체 수 반영 |
| --- | --- | --- | --- |
| 없음 | 로그인 이용자가 사진과 함께 제출 | `PENDING` | 없음 |
| `PENDING` | 관리자가 반려 | `REJECTED` | 없음 |
| `PENDING` | 관리자가 승인하고 변경 수를 확정 | `APPROVED` | `MachineCountRevision` 생성 후 반영 |

### 대기 상태 노출

| 조건 | 화면 표시 |
| --- | --- |
| `active_tracked_machine_count`가 `0` | `플레이 불가` |
| 유효 기간 내 대기 제보가 있음 | 가장 최근 유효 제보와 계산된 혼잡도 |
| 최신 제보가 관리자에 의해 숨김 처리됨 | 다음 유효 제보를 사용하거나 `확인 필요`, `정보 부족` |
| 유효한 대기 제보가 없음 | `확인 필요`, `정보 부족` |
| 마지막 대기 제보가 만료됨 | `확인 필요`, `정보 부족`, `n분 전 제보` 보조 표시 |

## 9. 권한 및 변경 규칙

| 작업 | 비로그인 | 로그인 이용자 | 관리자 |
| --- | --- | --- | --- |
| 점포/기종/혼잡도 조회 | 가능 | 가능 | 가능 |
| 대기 상태 작성 | 불가 | 가능 | 가능 |
| 이상 대기 제보 신고 | 불가 | 가능 | 가능 |
| 기기 변경 사진 제보 | 불가 | 가능 | 가능 |
| 점포/기종 등록 | 불가 | 불가 | 알파에서는 코드 또는 정적 데이터 갱신 |
| 기체 수 공개값 변경 | 불가 | 불가 | 가능 |
| 변경 제보 승인/반려 | 불가 | 불가 | 가능 |
| 제보 로그 열람 | 불가 | 본인 기록 범위는 추후 결정 | 가능 |
| 증거 사진 열람 | 불가 | 본인 제출 건 처리 상태만 가능 | 가능 |
| 신고 검토 및 제보 숨김 | 불가 | 불가 | 가능 |

## 10. 이슈와 모델 연결

| 모델 영역 | 먼저 확정할 작업 |
| --- | --- |
| 대기 상태와 만료 | `RR-001`, `RR-203`, `RR-204` |
| 초기 점포/기종/기체 수 | `RR-002`, `RR-103` |
| 혼잡도 파생값 | `RR-003`, `RR-106` |
| 사진과 변경 승인 이력 | `RR-004`, `RR-301`, `RR-303` |
| 신고 및 최소 운영 대응 | `RR-206`, `RR-207`, `RR-208`, `RR-402` |

## 11. 추후 확정할 데이터 정책

- 사진 내 얼굴 또는 개인정보 노출 대응 방식
- 관리자에 의한 대기 제보 숨김 또는 사용자 제한 기록 방식
