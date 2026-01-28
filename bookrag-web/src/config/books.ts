import { Globe, Brain, Activity, BookOpen, Mountain, Waves, Compass, Ruler, Calculator, Coins, Star, History, BarChart, Orbit, Sparkles } from 'lucide-react';
import firstBook from '../assets/first book.jpg';
import secondBook from '../assets/second-book.png';
import thirdBook from '../assets/third-book.jpg';
import orb1 from '../assets/planet-orb-1.png';
import orb2 from '../assets/planet-orb-2.png';
import orb3 from '../assets/planet-orb-3.png';

export interface Question {
    label: string;
    text: string;
    icon: any;
}

export interface BookConfig {
    id: string;
    title: string;
    orbImage: any;
    colors: {
        text: string;
        bg: string; // tailwind class for background
        hex: string;
        border: string;
        hover: string;
        fill: string; // For solid fills
    };
    icon: any;
    visualSrc: any;
    details: {
        author: string;
        year: string;
        genre: string;
        language: string;
    };
    description: string;
    features: string[];
    significance: string;
    questions: {
        English: Question[];
        Arabic: Question[];
    };
}

export const BOOKS: Record<string, BookConfig> = {
    geografia: {
        id: 'geografia',
        title: "Geographia",
        orbImage: orb1,
        colors: {
            text: "text-teal-600",
            bg: "bg-teal-50",
            hex: "#0d9488",
            border: "border-teal-200",
            hover: "hover:bg-teal-50",
            fill: "bg-teal-600"
        },
        icon: Globe,
        visualSrc: firstBook,
        details: {
            author: "Claudius Ptolemy",
            year: "c. 150 AD",
            genre: "Atlas / Cartography",
            language: "Ancient Greek"
        },
        description: `The *Geographia* (Geography) is a compilation of geographical coordinates and a treatise on cartography that defined the field for centuries. Written in Alexandria, it introduced the revolutionary concept of global coordinates (latitude and longitude) to map the known world. Ptolemy provided instructions for creating map projections to represent the curved Earth on a flat plane, transitioning map-making from an artistic endeavor to a mathematical discipline.`,
        features: [
            "Introduced the grid system of latitude and longitude.",
            "Described map projections for the spherical Earth.",
            "Cataloged coordinates for over 8,000 locations.",
            "Differentiated between Geography (global) and Chorography (regional)."
        ],
        significance: "Lost to the West for a millennium, its rediscovery in the 15th century sparked the Renaissance in cartography, directly influencing the Age of Exploration and the maps used by Columbus.",
        questions: {
            English: [
                { label: "Geography Definition", text: "How does Ptolemy define Geography versus Chorography?", icon: BookOpen },
                { label: "Map Projections", text: "What methods does the book describe for projecting a sphere onto a plane?", icon: Globe },
                { label: "Oikumene", text: "How does Ptolemy describe the extent of the known inhabited world (Oikumene)?", icon: Mountain },
                { label: "Coordinate System", text: "How does the book utilize latitude and longitude to locate cities?", icon: Waves }
            ],
            Arabic: [
                { label: "تعريف الجغرافيا", text: "كيف يميز بطليموس بين الجغرافيا والكوروغرافيا؟", icon: BookOpen },
                { label: "إسقاط الخرائط", text: "ما هي الطرق التي يصفها الكتاب لإسقاط الكرة على سطح مستو؟", icon: Globe },
                { label: "المعمورة", text: "كيف يصف بطليموس حدود العالم المسكون (المعمورة)؟", icon: Mountain },
                { label: "نظام الإحداثيات", text: "كيف يستخدم الكتاب خطوط الطول والعرض لتحديد مواقع المدن؟", icon: Waves }
            ]
        }
    },
    tractatus: {
        id: 'tractatus',
        title: "Tractatus Logico-Philosophicus",
        orbImage: orb2,
        colors: {
            text: "text-violet-600",
            bg: "bg-violet-50",
            hex: "#7c3aed",
            border: "border-violet-200",
            hover: "hover:bg-violet-50",
            fill: "bg-violet-600"
        },
        icon: Brain,
        visualSrc: secondBook,
        details: {
            author: "Ludwig Wittgenstein",
            year: "1921",
            genre: "Philosophical Logic",
            language: "German"
        },
        description: `The *Tractatus Logico-Philosophicus* is the only book-length philosophical work published by Ludwig Wittgenstein during his lifetime. It aims to define the relationship between language and reality and to delimit the sphere of the sayable. The work is structured as a series of 525 hierarchically numbered assertions, famously concluding: "Whereof one cannot speak, thereof one must be silent." It presents the "picture theory" of meaning, arguing that language represents the world by mirroring the logical form of facts.`,
        features: [
            "Asserts that 'The world is everything that is the case.'",
            "Presents the 'Picture Theory' of meaning.",
            "Distinguishes between what can be said and what must be shown.",
            "Seven main propositions numbered 1 to 7."
        ],
        significance: "A seminal work of 20th-century analytic philosophy, it profoundly influenced the Vienna Circle and Logical Positivism, though Wittgenstein later critiqued its conclusions.",
        questions: {
            English: [
                { label: "Sphere Measurement", text: "How is the diameter of a sphere measured in Stereometry?", icon: Compass },
                { label: "Tower Height", text: "How do you measure a tower's height from two stations?", icon: Ruler },
                { label: "Geometric Mean", text: "How do you find the geometric mean using the instrument?", icon: Calculator },
                { label: "Currency Conversion", text: "What rule is given for converting currencies?", icon: Coins }
            ],
            Arabic: [
                { label: "قياس الكرة", text: "كيف يتم قياس قطر الكرة في علم القياس المجسم؟", icon: Compass },
                { label: "ارتفاع البرج", text: "كيف تقيس ارتفاع برج من محطتين؟", icon: Ruler },
                { label: "الوسط الهندسي", text: "كيف تجد الوسط الهندسي باستخدام الأداة؟", icon: Calculator },
                { label: "تحويل العملات", text: "ما هي القاعدة المذكورة لتحويل العملات؟", icon: Coins }
            ]
        }
    },
    tabulae: {
        id: 'tabulae',
        title: "Tabulae Rudolphinae",
        orbImage: orb3,
        colors: {
            text: "text-amber-600",
            bg: "bg-amber-50",
            hex: "#d97706",
            border: "border-amber-200",
            hover: "hover:bg-amber-50",
            fill: "bg-amber-600"
        },
        icon: Sparkles, // Using Sparkles as in Header.tsx
        visualSrc: thirdBook,
        details: {
            author: "Johannes Kepler",
            year: "1627",
            genre: "Astronomy / Star Catalog",
            language: "Latin"
        },
        description: `The *Tabulae Rudolphinae* (Rudolphine Tables) is a star catalog and set of planetary tables published by Johannes Kepler in 1627, based on the observational data of Tycho Brahe. Dedicated to Emperor Rudolf II, it was the first catalog to include corrective factors for atmospheric refraction and logarithmic tables. It allowed for the calculation of planetary positions with unprecedented accuracy, providing strong support for the heliocentric model of the solar system.`,
        features: [
            "Based on the precise observations of Tycho Brahe.",
            "First use of logarithms in astronomical tables.",
            "Included corrections for atmospheric refraction.",
            "Predicted the transit of Mercury and Venus."
        ],
        significance: "The tables were significantly more accurate than previous ones and served as the standard for astronomy for over a century, cementing the acceptance of the heliocentric model.",
        questions: {
            English: [
                { label: "Primary Purpose", text: "What is the primary purpose of the Rudolphine Tables?", icon: Star },
                { label: "Reinhold's Event", text: "What event does Erasmus Reinhold mention in 1415?", icon: History },
                { label: "Brahe's Data", text: "What role did Tycho Brahe's data play in creating these tables?", icon: BarChart },
                { label: "Planetary Positions", text: "How are the planetary positions calculated in this work?", icon: Orbit }
            ],
            Arabic: [
                { label: "الغرض الأساسي", text: "ما هو الغرض الأساسي من الجداول الرودلفية؟", icon: Star },
                { label: "حدث راينهولد", text: "ما هو الحدث الذي ذكره إيراسموس راينهولد في عام 1415؟", icon: History },
                { label: "بيانات براهي", text: "ما هو الدور الذي لعبته بيانات تايكو براهي في إنشاء هذه الجداول؟", icon: BarChart },
                { label: "حساب الكواكب", text: "كيف يتم حساب مواقع الكواكب في هذا العمل؟", icon: Orbit }
            ]
        }
    }
};

export const BOOKS_LIST = Object.values(BOOKS).map(book => ({
    id: book.id,
    title: book.title,
    orbImage: book.orbImage,
    colors: book.colors,
    icon: book.icon
}));
