import {
    GlobeAltIcon,
    ServerIcon,
    CogIcon,
    HomeIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    DocumentTextIcon,
    PhotoIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    PuzzlePieceIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
    PaintBrushIcon
} from '@heroicons/react/24/outline';

export const getIconComponent = (iconName) => {
    const iconMap = {
        globe: GlobeAltIcon,
        server: ServerIcon,
        cog: CogIcon,
        home: HomeIcon,
        building: BuildingOfficeIcon,
        users: UserGroupIcon,
        shopping: ShoppingBagIcon,
        document: DocumentTextIcon,
        photo: PhotoIcon,
        video: VideoCameraIcon,
        music: MusicalNoteIcon,
        puzzle: PuzzlePieceIcon,
        chart: ChartBarIcon,
        shield: ShieldCheckIcon,
        wrench: WrenchScrewdriverIcon,
        paint: PaintBrushIcon,
    };
    
    return iconMap[iconName] || GlobeAltIcon;
};
