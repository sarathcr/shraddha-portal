export interface User {
  id: string
  name: string
  employeeId: string
  email: string
  team: string
  role: string
}

export const createUser = async (
  payload: Omit<User, 'id'>,
): Promise<{ message: string; data: User }> => {
  const response = await fetch('/test.json')
  const users: User[] = await response.json()

  const emailExists = users.some((u: User) => u.email === payload.email)
  if (emailExists) {
    throw {
      error: {
        businessError: 1002,
        message: 'User creation failed',
        errorValue: 'Email already exists',
        type: 'ConflictError',
      },
    }
  }

  const newUser: User = {
    id: `user${users.length + 1}`,
    ...payload,
  }

  users.push(newUser)

  return {
    message: 'User created successfully',
    data: newUser,
  }
}
