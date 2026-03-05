export interface LookingForMode {
    id: string;
    label: string;
    emoji: string;
    color: string;
    matchMessage: string;
    icebreaker: string;
}

export const LOOKING_FOR_MODES: LookingForMode[] = [
    {
        id: 'romance',
        label: 'Romance',
        emoji: '💜',
        color: '#FF6B9D',
        matchMessage: "It's a Match! 💜",
        icebreaker: "You both hold [shared NFT] — who bought first? 👀",
    },
    {
        id: 'friends',
        label: 'Friends',
        emoji: '👋',
        color: '#14F195',
        matchMessage: "New Friend Alert! 👋",
        icebreaker: "What Solana event are you going to next?",
    },
    {
        id: 'cofounder',
        label: 'Co-founder',
        emoji: '🤝',
        color: '#9945FF',
        matchMessage: "Time to build together 🤝",
        icebreaker: "What are you building right now?",
    },
    {
        id: 'trading',
        label: 'Trading Buddy',
        emoji: '📈',
        color: '#FFD700',
        matchMessage: "Bullish on each other 📈",
        icebreaker: "What's your highest conviction trade right now?",
    },
    {
        id: 'irl',
        label: 'IRL Meetup',
        emoji: '🌍',
        color: '#FF9945',
        matchMessage: "See you in the real world 🌍",
        icebreaker: "What city are you based in?",
    },
    {
        id: 'mentor',
        label: 'Mentor',
        emoji: '🧠',
        color: '#45B7FF',
        matchMessage: "Someone's got wisdom to share 🧠",
        icebreaker: "What's one thing you wish you knew earlier in Web3?",
    },
    {
        id: 'vibing',
        label: 'Just Vibing',
        emoji: '🎯',
        color: '#FF45B7',
        matchMessage: "Good vibes incoming 🎯",
        icebreaker: "What's the most underrated thing in Solana right now?",
    },
    {
        id: 'accountability',
        label: 'Accountability Partner',
        emoji: '⚡',
        color: '#F7B731',
        matchMessage: "Your new accountability partner ⚡",
        icebreaker: "What's your #1 goal this month?",
    },
    {
        id: 'collab',
        label: 'Collab & Build',
        emoji: '🛠️',
        color: '#26de81',
        matchMessage: "Let's ship something 🛠️",
        icebreaker: "What's your strongest skill in Web3?",
    },
    {
        id: 'talk',
        label: 'Someone to Talk To',
        emoji: '🗣️',
        color: '#a29bfe',
        matchMessage: "Someone's listening 🗣️",
        icebreaker: "What's been on your mind lately?",
    },
];

/** Quick lookup by id */
export const getModeById = (id: string): LookingForMode | undefined =>
    LOOKING_FOR_MODES.find(m => m.id === id);
