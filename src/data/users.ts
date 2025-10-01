export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const users: User[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Parakrama',
    avatar: '👨‍💼'
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Pasindu',
    avatar: '👨‍💻'
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Rashmika',
    avatar: '👩‍🎨'
  }
];

export const usersMap = new Map(users.map(user => [user.id, user]));
