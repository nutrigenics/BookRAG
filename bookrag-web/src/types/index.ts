export interface Reference {
    page: string;
    text: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    references?: Reference[];
}
