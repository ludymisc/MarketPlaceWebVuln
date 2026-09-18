import {z} from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: "Format tidak valid"}),
    password: z.string().min(8, {message: "Password minimal 8 karakter"})
})

export default registerSchema;