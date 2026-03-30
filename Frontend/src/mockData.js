export const VEG_MEALS = {
  breakfast: {
    name: 'Oats & Fruit Bowl',
    items: ['Rolled oats', 'Banana', 'Mixed berries', 'Honey', 'Almonds'],
    kcal: 420,
    time: '8:00 AM',
  },
  lunch: {
    name: 'Dal & Brown Rice',
    items: ['Yellow dal', 'Brown rice', 'Cucumber raita', 'Sabzi', 'Papad'],
    kcal: 650,
    time: '1:00 PM',
  },
  dinner: {
    name: 'Paneer Tikka Wrap',
    items: ['Whole wheat roti', 'Paneer tikka', 'Mixed greens', 'Mint chutney'],
    kcal: 520,
    time: '7:30 PM',
  },
};

export const NONVEG_MEALS = {
  breakfast: {
    name: 'Egg White Omelette',
    items: ['3 egg whites', 'Spinach', 'Mushrooms', 'Whole grain toast'],
    kcal: 380,
    time: '8:00 AM',
  },
  lunch: {
    name: 'Grilled Chicken Rice Bowl',
    items: ['Chicken breast', 'Brown rice', 'Broccoli', 'Olive oil dressing'],
    kcal: 680,
    time: '1:00 PM',
  },
  dinner: {
    name: 'Salmon & Quinoa',
    items: ['Baked salmon', 'Quinoa', 'Asparagus', 'Lemon herb sauce'],
    kcal: 540,
    time: '7:30 PM',
  },
};

export const MOCK_WORKOUTS = {
  Light: [
    { label: '30 min Walk', icon: '🚶' },
    { label: 'Stretching', icon: '🧘' },
  ],
  Moderate: [
    { label: '45 min Run', icon: '🏃' },
    { label: 'Upper Body', icon: '💪' },
    { label: 'Core Circuit', icon: '🔥' },
  ],
  Heavy: [
    { label: 'Strength Training', icon: '🏋️' },
    { label: 'HIIT — 40 min', icon: '⚡' },
    { label: 'Cardio Blast', icon: '🔥' },
    { label: 'Mobility Work', icon: '🧘' },
  ],
};

export const MOCK_CONSULTANTS = [
    {
        "idx": 0,
        "cons_id": "1a2b3c4d-1234-4321-8123-abcdef123401",
        "specialization": "Dietician",
        "available_time": "9A.M. - 5P.M.",
        "available_days": "Monday to Friday",
        "charges": "1500",
        "contact_no": "9876543211",
        "email": "amit.desai@gmail.com",
        "location": "Mumbai",
        "name": "Amit Desai"
    },
    {
        "idx": 1,
        "cons_id": "1a2b3c4d-1234-4321-8123-abcdef123402",
        "specialization": "Physician",
        "available_time": "10A.M. - 8P.M.",
        "available_days": "Monday, Wednesday, Friday",
        "charges": "2000",
        "contact_no": "9876543212",
        "email": "priya.sharma@hotmail.com",
        "location": "Pune",
        "name": "Priya Sharma"
    },
    {
        "idx": 2,
        "cons_id": "1a2b3c4d-1234-4321-8123-abcdef123403",
        "specialization": "Physician",
        "available_time": "11A.M. - 7P.M.",
        "available_days": "Tuesday, Thursday, Saturday",
        "charges": "1800",
        "contact_no": "9876543213",
        "email": "vikram.singh@yahoo.com",
        "location": "Bangalore",
        "name": "Vikram Singh"
    },
    {
        "idx": 3,
        "cons_id": "1a2b3c4d-1234-4321-8123-abcdef123404",
        "specialization": "Dietician",
        "available_time": "8A.M. - 2P.M.",
        "available_days": "Monday to Saturday",
        "charges": "1200",
        "contact_no": "9876543214",
        "email": "neha.gupta@outlook.com",
        "location": "Hyderabad",
        "name": "Neha Gupta"
    }
];