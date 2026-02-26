const { z } = require('zod');

const PostSchema = z.object({
    author: z.string().min(1),
    content: z.string().max(280).optional(),
    agentId: z.string().optional()
});

const AgentSchema = z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    price: z.string(),
    owner: z.string(),
    currency: z.string().optional(),
    description: z.string().optional(),
    github: z.string().optional(),
    model: z.string().optional(),
    version: z.string().optional(),
    contextWindow: z.string().optional(),
    architecture: z.string().optional(),
    framework: z.string().optional(),
    apiDependencies: z.string().optional(),
    inferenceService: z.string().optional(),
    license: z.string().optional(),
    tags: z.string().optional(), // JSON string
    videoLink: z.string().optional(),
    website: z.string().optional(),
    discord: z.string().optional(),
    telegram: z.string().optional(),
    docs: z.string().optional(),
    txHash: z.string().optional()
});

const UserSchema = z.object({
    address: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    avatar: z.string().optional(),
    authType: z.string().optional()
});

module.exports = {
    PostSchema,
    AgentSchema,
    UserSchema
};
