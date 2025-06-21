// models/userModel.ts
const fakeUsers = [
  { id: 1, email: 'tests@example.com', password: '1234' },
];

export const findUserByEmail = (email: string) => {
  return fakeUsers.find(user => user.email === email);
};
