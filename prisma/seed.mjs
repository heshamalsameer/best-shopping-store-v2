import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoUsers = [
  { email: "demo@bestshopping.dev", username: "demo", password: "demo1234", isAdmin: false },
  { email: "admin@gmail.com", username: "admin", password: "123456", isAdmin: true },
];

const demoProducts = [
  ["Wireless Keyboard K380", "Slim multi-device Bluetooth keyboard. Switch between laptop, tablet and phone with one tap — quiet keys and two years of battery.", "39"],
  ["Mechanical Keyboard TKL", "Tenkeyless mechanical keyboard with hot-swap switches, PBT keycaps and white backlight. Built for long coding sessions.", "89"],
  ["Ergonomic Mouse MX", "Sculpted mouse that keeps your wrist in a natural position. 4000 DPI sensor and USB-C fast charging.", "59"],
  ["USB-C Hub 8-in-1", "HDMI 4K, 2× USB-A, SD/microSD, Ethernet and 100W pass-through charging in an aluminium body.", "45"],
];

async function main() {
  for (const u of demoUsers) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { isAdmin: u.isAdmin },
      create: { email: u.email, username: u.username, password, isAdmin: u.isAdmin },
    });
  }
  if ((await prisma.product.count()) === 0) {
    for (const [title, description, price] of demoProducts) {
      await prisma.product.create({ data: { title, description, price, image: "/360_F_241431868_8DFQpCcmpEPVG0UvopdztOAd4a6Rqsoo.jpg" } });
    }
  }
  console.log("Seed finished: demo accounts are ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
