import fs from "fs";
import { faker } from "@faker-js/faker";

const generateTitles = (number) =>
  Array.from({ length: number }, () => faker.person.jobTitle());
const generateCountries = (number) =>
  Array.from({ length: number }, () => faker.location.country());

const titles = generateTitles(50);
const countries = generateCountries(50);

const generateCustomers = (number) =>
  Array.from({ length: number }, (_, index) => ({
    id: `${index}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    title: titles[Math.floor(Math.random() * titles.length)],
    email: faker.internet.email(),
    country: countries[Math.floor(Math.random() * countries.length)],
  }));

fs.writeFileSync(
  "./db.json",
  JSON.stringify({
    customers: generateCustomers(30),
    titles,
    countries,
  })
);
