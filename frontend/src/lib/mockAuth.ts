// Mock authentication for testing without backend
export const mockUsers = [
  {
    email: 'a@a.com',
    password: '12345678',
    name: 'Test User'
  }
];

export const mockLogin = async (email: string, password: string) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      success: true,
      data: {
        name: user.name,
        email: user.email
      }
    };
  }
  
  throw new Error('Invalid credentials');
};

export const mockGetUser = async () => {
  return {
    success: true,
    data: {
      name: 'Test User',
      email: 'a@a.com'
    }
  };
};
