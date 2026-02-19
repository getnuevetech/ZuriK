async function bootstrap() {
    // Initialize the app
    const app = await App.create();

    // Seed the database before the app starts listening
    await seedDatabase(); // Ensure you have a seedDatabase function implemented

    // Make the app listen on the defined port
    await app.listen();
}

bootstrap();