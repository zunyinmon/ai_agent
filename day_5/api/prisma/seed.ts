import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        username: faker.internet.username().toLowerCase(),
        bio: faker.lorem.sentence(),
        password,
      },
    });

    const post = await prisma.post.create({
      data: {
        content: faker.lorem.paragraph(),
        userId: user.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        userId: user.id,
        postId: post.id,
      },
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });