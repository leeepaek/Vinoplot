export const mapData = {
    "chambolle-musigny": {
        viewBox: "0 0 800 600",
        label: "Chambolle-Musigny",
        description: "The most feminine of the Côte de Nuits wines.",
        parcels: [
            {
                id: 'musigny',
                name: 'Musigny',
                type: 'Grand Cru',
                // 밭의 대략적인 모양을 SVG Path로 표현 (오른쪽 상단 위치)
                path: 'M 550 100 L 650 120 L 680 200 L 600 250 L 520 180 Z',
                color: 'text-burgundy-500'
            },
            {
                id: 'bonnes-mares',
                name: 'Bonnes-Mares',
                type: 'Grand Cru',
                // 북쪽 끝자락
                path: 'M 400 50 L 520 70 L 540 150 L 450 180 L 380 120 Z',
                color: 'text-burgundy-500'
            },
            {
                id: 'amoureuses',
                name: 'Les Amoureuses',
                type: 'Premier Cru',
                // 뮈지니 바로 아래
                path: 'M 580 260 L 660 270 L 690 320 L 620 350 L 550 300 Z',
                color: 'text-champagne-500'
            },
            {
                id: 'charmes',
                name: 'Les Charmes',
                type: 'Premier Cru',
                // 마을 중앙부
                path: 'M 400 300 L 500 320 L 520 400 L 450 450 L 350 380 Z',
                color: 'text-champagne-500'
            },
            {
                id: 'village',
                name: 'Chambolle-Musigny Village',
                type: 'Village',
                // 나머지 마을 단위 구획 (배경 역할)
                path: 'M 100 100 L 380 50 L 380 150 L 300 400 L 400 550 L 150 500 L 50 300 Z',
                color: 'text-zinc-700'
            }
        ]
    }
};
