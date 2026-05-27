export const QUEUE_LEVELS = [
  "EMPTY",
  "IN_USE_NO_QUEUE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
  "UNKNOWN",
] as const;

export type QueueLevel = (typeof QUEUE_LEVELS)[number];

export const STORE_STATUSES = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "HIDDEN",
] as const;

export type StoreStatus = (typeof STORE_STATUSES)[number];

export type AlphaRegion = "서울" | "경기" | "인천";

export const MACHINE_GROUP_STATUSES = [
  "CURRENT_VERSION_ONLINE",
  "OLD_VERSION_OR_UPDATE_ENDED",
  "OFFLINE",
  "UNKNOWN",
] as const;

export type MachineGroupStatus = (typeof MACHINE_GROUP_STATUSES)[number];

export interface AlphaMachineGroup {
  readonly cabinetModel: string;
  readonly softwareVersion: string;
  readonly machineCount: number | null;
  readonly activeMachineCount: number | null;
  readonly status: MachineGroupStatus;
  readonly isQueueTracked: boolean;
  readonly queueLevel: QueueLevel;
  readonly lastReportedAt: string | null;
  readonly lastVerifiedAt: string | null;
  readonly notes: string;
}

export interface AlphaGame {
  readonly title: string;
  readonly totalMachineCount: number | null;
  readonly trackedMachineCount: number | null;
  readonly activeTrackedMachineCount: number | null;
  readonly untrackedMachineCount: number | null;
  readonly queueLevel: QueueLevel;
  readonly machineGroups: readonly AlphaMachineGroup[];
  readonly lastReportedAt: string | null;
  readonly lastVerifiedAt: string | null;
}

export interface AlphaStore {
  readonly id: string;
  readonly name: string;
  readonly region: AlphaRegion;
  readonly area: string;
  readonly status: StoreStatus;
  readonly notes: string;
  readonly games: readonly AlphaGame[];
}

export const QUEUE_LEVEL_LABELS: Record<QueueLevel, string> = {
  EMPTY: "빈 기기 있음",
  IN_USE_NO_QUEUE: "플레이 중 / 대기 없음",
  LOW: "대기 적음",
  MEDIUM: "대기 보통",
  HIGH: "대기 많음",
  VERY_HIGH: "대기 매우 많음",
  UNKNOWN: "확인 필요",
};

const PENDING_VERIFICATION_NOTE =
  "알파 대상 점포입니다. 표시 기종과 분류별 기체 수는 관리자 검수 후 추가됩니다.";

const HANSUNG_VERIFIED_AT = "2026-05-27";
const HANSUNG_CURRENT_VERSION_NOTE =
  "2026-05-27 현장 조사 기준 최신 버전 업데이트 확인. 대기 상태는 아직 제보 전입니다.";

export const alphaStores: readonly AlphaStore[] = [
  {
    id: "noryangjin-amuse-town",
    name: "노량진 어뮤즈타운",
    region: "서울",
    area: "노량진",
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
  },
  {
    id: "taereung-beat-research-t",
    name: "태릉입구역 비트연구소 T",
    region: "서울",
    area: "태릉입구역",
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
  },
  {
    id: "hansung-woori-gamejang-2",
    name: "한성대 우리게임장2",
    region: "서울",
    area: "한성대",
    status: "ACTIVE",
    notes:
      "2026-05-27 현장 조사로 최신 버전 업데이트 기체 수를 확인했습니다. 대기 상태는 아직 제보 전입니다.",
    games: [
      {
        title: "비트매니아 IIDX 33 스파클 샤워",
        totalMachineCount: 6,
        trackedMachineCount: 6,
        activeTrackedMachineCount: 6,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "라이트닝 모델 (신기체)",
            softwareVersion: "비트매니아 IIDX 33 스파클 샤워",
            machineCount: 3,
            activeMachineCount: 3,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
          {
            cabinetModel: "디럭스 모델 (구기체)",
            softwareVersion: "비트매니아 IIDX 33 스파클 샤워",
            machineCount: 3,
            activeMachineCount: 3,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes:
              "구기체지만 2026-05-27 현장 조사 기준 최신 버전 업데이트 확인. 대기 상태는 아직 제보 전입니다.",
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "사운드 볼텍스 나블라",
        totalMachineCount: 7,
        trackedMachineCount: 7,
        activeTrackedMachineCount: 7,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "발키리 모델 (신기체)",
            softwareVersion: "사운드 볼텍스 나블라",
            machineCount: 7,
            activeMachineCount: 7,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "CHUNITHM X-VERSE-X",
        totalMachineCount: 2,
        trackedMachineCount: 2,
        activeTrackedMachineCount: 2,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "CHUNITHM X-VERSE-X",
            machineCount: 2,
            activeMachineCount: 2,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "maimai DX CiRCLE",
        totalMachineCount: 4,
        trackedMachineCount: 4,
        activeTrackedMachineCount: 4,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "maimai DX CiRCLE",
            machineCount: 4,
            activeMachineCount: 4,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "노스텔지어 Op.3",
        totalMachineCount: 1,
        trackedMachineCount: 1,
        activeTrackedMachineCount: 1,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "노스텔지어 Op.3",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "유비트 비욘드 디 애비뉴",
        totalMachineCount: 1,
        trackedMachineCount: 1,
        activeTrackedMachineCount: 1,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "유비트 비욘드 디 애비뉴",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "태고의 달인 NIJIIRO",
        totalMachineCount: 1,
        trackedMachineCount: 1,
        activeTrackedMachineCount: 1,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "태고의 달인 NIJIIRO",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "DDR WORLD",
        totalMachineCount: 1,
        trackedMachineCount: 1,
        activeTrackedMachineCount: 1,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "DDR WORLD",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "펌프 잇 업 PHOENIX",
        totalMachineCount: 1,
        trackedMachineCount: 1,
        activeTrackedMachineCount: 1,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "모델 미기록",
            softwareVersion: "펌프 잇 업 PHOENIX",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "GITADORA GALAXY WAVE DELTA",
        totalMachineCount: 4,
        trackedMachineCount: 2,
        activeTrackedMachineCount: 2,
        untrackedMachineCount: 2,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "아레나 모델 기타 (신기체)",
            softwareVersion: "GITADORA GALAXY WAVE DELTA",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
          {
            cabinetModel: "아레나 모델 드럼 (신기체)",
            softwareVersion: "GITADORA GALAXY WAVE DELTA",
            machineCount: 1,
            activeMachineCount: 1,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
          {
            cabinetModel: "구기체 기타",
            softwareVersion: "최신 버전과 상이함",
            machineCount: 1,
            activeMachineCount: 1,
            status: "OLD_VERSION_OR_UPDATE_ENDED",
            isQueueTracked: false,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes:
              "2026-05-27 현장 조사 참고 정보. 버전이 달라 대기열 추적에서 제외합니다.",
          },
          {
            cabinetModel: "구기체 드럼",
            softwareVersion: "최신 버전과 상이함",
            machineCount: 1,
            activeMachineCount: 1,
            status: "OLD_VERSION_OR_UPDATE_ENDED",
            isQueueTracked: false,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes:
              "2026-05-27 현장 조사 참고 정보. 버전이 달라 대기열 추적에서 제외합니다.",
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
      {
        title: "팝픈뮤직 High☆Cheers!!",
        totalMachineCount: 4,
        trackedMachineCount: 4,
        activeTrackedMachineCount: 4,
        untrackedMachineCount: 0,
        queueLevel: "UNKNOWN",
        machineGroups: [
          {
            cabinetModel: "반짝반짝 팝군 모델 (신기체)",
            softwareVersion: "팝픈뮤직 High☆Cheers!!",
            machineCount: 4,
            activeMachineCount: 4,
            status: "CURRENT_VERSION_ONLINE",
            isQueueTracked: true,
            queueLevel: "UNKNOWN",
            lastReportedAt: null,
            lastVerifiedAt: HANSUNG_VERIFIED_AT,
            notes: HANSUNG_CURRENT_VERSION_NOTE,
          },
        ],
        lastReportedAt: null,
        lastVerifiedAt: HANSUNG_VERIFIED_AT,
      },
    ],
  },
  {
    id: "bucheon-attack",
    name: "부천 어택",
    region: "경기",
    area: "부천",
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
  },
  {
    id: "bucheon-p2-zone",
    name: "부천 P2존",
    region: "경기",
    area: "부천",
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
  },
  {
    id: "juan-cpu-gameland",
    name: "주안 CPU 게임랜드",
    region: "인천",
    area: "주안",
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
  },
];
