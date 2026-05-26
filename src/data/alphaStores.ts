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

export interface AlphaGame {
  readonly title: string;
  readonly totalMachineCount: number | null;
  readonly trackedMachineCount: number | null;
  readonly activeTrackedMachineCount: number | null;
  readonly legacyMachineCount: number | null;
  readonly queueLevel: QueueLevel;
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
    status: "PENDING_VERIFICATION",
    notes: PENDING_VERIFICATION_NOTE,
    games: [],
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
