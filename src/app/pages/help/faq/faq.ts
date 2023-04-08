export type Faq = Category[];

interface Category {
    /**
     * a (in the section) unique id for e.g. the link fragment/anchor
     */
    id: string;
    name: string;
    questions: Question[];
}

interface Question {
    /**
     * a (in the category) unique id for e.g. the link fragment/anchor
     */
    id: string;
    question: string;
    answer: string;
    /**
     * The answer is not searched -> include keywords that do not appear in the category name or question
     */
    keywords: string[];
}
