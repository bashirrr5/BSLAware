# BSLAware
BSL Aware, a freely accessible, full-stack web platform for learning British sign language (BSLAware). The project was motivated by an obvious and well- evidenced gap in the digital resources available to BSL learners.
How to open
1.Download and extract the project zip file
2.Open the extracted folder in VS Code.
3.Open a terminal inside the project folder. To do this on Windows, click the folder path bar at
the top of file explorer, type cmd and press Enter. This should open a command prompt directly
in the project directory.
4.Run the following commands in order:
npm i
This installs all project dependencies listed in package.json.
npm run db:migrate
This applies all four Drizzle database migrations, creating the SQLite database schema.
npx tsx src\lib\server\db\seed.ts
This populates the database with lesson content, quiz questions and dictionary entries. If
prompted to download tsx, select yes.
npm run dev
