// Chambolle-Musigny 실제 좌표 데이터
// 중심 좌표: 47.1856° N, 4.9525° E

export const geoData = {
    center: [47.1856, 4.9525], // 샹볼 뮈지니 중심
    zoom: 14,
    parcels: [
        {
            id: "musigny",
            name: "Musigny Grand Cru",
            type: "Grand Cru",
            // 실제 뮈지니 그랑 크뤼 대략적 경계 (정확한 좌표는 아니지만 실제 위치 근사)
            coordinates: [
                [47.1805, 4.9550],
                [47.1830, 4.9560],
                [47.1840, 4.9530],
                [47.1820, 4.9510],
            ],
            description: "견고함과 우아함의 완벽한 조화"
        },
        {
            id: "ls-amoureuses",
            name: "Les Amoureuses",
            type: "Premier Cru",
            // 뮈지니 바로 아래 위치
            coordinates: [
                [47.1780, 4.9560],
                [47.1800, 4.9570],
                [47.1805, 4.9550], // 뮈지니와 접경
                [47.1790, 4.9540],
            ],
            description: "연인들이라는 이름처럼 매혹적인 와인"
        },
        {
            id: "bonnes-mares",
            name: "Bonnes-Mares",
            type: "Grand Cru",
            // 마을 북쪽 모레-생-드니 접경
            coordinates: [
                [47.1900, 4.9500],
                [47.1920, 4.9520],
                [47.1910, 4.9550],
                [47.1880, 4.9530],
            ],
            description: "더 남성적이고 구조감 있는 스타일"
        },
        {
            id: "les-charmes",
            name: "Les Charmes",
            type: "Premier Cru",
            // 마을 중심부
            coordinates: [
                [47.1850, 4.9550],
                [47.1860, 4.9580],
                [47.1840, 4.9600],
                [47.1830, 4.9570],
            ],
            description: "풍성하고 매력적인 과실향"
        }
    ]
};
