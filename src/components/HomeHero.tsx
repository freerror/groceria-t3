function HomeHero() {
  return (
    <div className="hero min-h-screen bg-super">
      <div className="hero-overlay bg-stone-500 bg-opacity-90"></div>
      <div className="hero-content text-justify text-neutral-content">
        <div className="flex max-w-md flex-col items-center gap-8 font-mono">
          <h1 className="text-5xl font-bold">Groceria!</h1>
          <p>
            Groceria is an online tool that lets you define your own groceries
            and recipes. You can create recipes from scratch and generate and
            customize grocery lists based on your weekly menu. Groceria makes
            cooking and shopping easy and fun. Try it today!
          </p>
          <h1 className="text-4xl">Features</h1>
          <ul className="list-inside list-disc">
            <li className="">Define your own recipes and grocery products</li>
            <li>Generate grocery lists from selected recipes</li>
            <li>Its your data: JSON Import and export</li>
            <li>Share your grocery list with your shopper!</li>
          </ul>
          <button className="btn-primary btn mt-5">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
