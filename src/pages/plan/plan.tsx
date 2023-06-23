import { type Product } from "@prisma/client";
import Image from "next/image";
import { type ReactElement, useState } from "react";
import FormCols2 from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";

type SectionNames = "recipes" | "products" | "groceries";

function NavLink(props: {
  current: SectionNames;
  section: SectionNames;
  onClick: (section: SectionNames) => void;
  children: ReactElement | string;
}) {
  return (
    <a
      className={
        props.current === props.section ? "text-black" : "text-gray-400"
      }
      onClick={() => {
        props.onClick(props.section);
      }}
    >
      {props.children}
    </a>
  );
}

function Section(props: {
  title: string;
  nextSection?: SectionNames;
  previousSection?: SectionNames;
  children: ReactElement | string | ReactElement[] | undefined;
  setSection: (section: SectionNames) => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <h2 className="mt-0">{props.title}</h2>
      </div>
      <div className="mb-4 flex h-full flex-col gap-4 overflow-scroll rounded-2xl border p-3 shadow-inner">
        {props.children}
      </div>
      <div className="flex flex-row gap-2 self-end">
        <button
          className="btn-sm btn"
          disabled={props.previousSection === undefined}
          onClick={() => {
            if (props.previousSection) props.setSection(props.previousSection);
          }}
        >
          Previous
        </button>
        <button
          className="btn-sm btn"
          disabled={props.nextSection === undefined}
          onClick={() => {
            if (props.nextSection) props.setSection(props.nextSection);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

type CountableProduct = { count: number } & Product;

function Plan() {
  const [section, setSection] = useState<SectionNames>("recipes");
  const [chosenRecipes, setChosenRecipes] = useState<string[]>([]);
  const [chosenProduct, setChosenProducts] = useState<Product[]>([]);
  const recipeProducts = api.recipeRelations.getAll.useQuery().data || [];
  const products = api.product.getAll.useQuery().data || [];
  const recipes = api.recipe.getAll.useQuery().data || [];

  function handleNav(section: SectionNames) {
    setSection(section);
  }
  function handleChooseRecipe(recipe: string): void {
    setChosenRecipes((prev) => [...prev, recipe]);
  }
  function handleAddRecipeProducts(recipeId: string) {
    setChosenProducts((prev) => {
      const newProducts = [
        ...(recipeProducts
          .filter((rel) => rel.recipeId === recipeId)
          .map((rel) =>
            products.find((prod) => prod.id === rel.productId)
          ) as Product[]),
        ...prev,
      ];
      newProducts.sort((a, b) => a.title.localeCompare(b.title));
      return newProducts;
    });
  }

  function handleRemoveRecipeProducts(recipeId: string) {
    console.log(recipeId);
  }

  return (
    <FormPage>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <NavLink current={section} section="recipes" onClick={handleNav}>
              Choose Recipes
            </NavLink>
          </li>
          <li>
            <NavLink current={section} section="products" onClick={handleNav}>
              Choose Products
            </NavLink>
          </li>
          <li>
            <NavLink current={section} section="groceries" onClick={handleNav}>
              Share Grocery List
            </NavLink>
          </li>
        </ul>
      </div>
      <FormCols2
        panel={
          <>
            {section === "recipes" ? (
              <Section
                title="Choose Recipes"
                nextSection="products"
                setSection={setSection}
              >
                {recipes.map((recipe, idx) => {
                  const ingreds: Product[] = [];
                  recipeProducts
                    ?.filter((rel) => rel.recipeId === recipe.id)
                    .forEach((rel) => {
                      const found = products.find(
                        (prod) => prod.id === rel.productId
                      );
                      if (found) ingreds.push(found);
                    });
                  ingreds.sort((a, b) => a.title.localeCompare(b.title));
                  const ingredTitles: string[] = ingreds.map((ing) =>
                    ing ? ing.title : "Error"
                  );

                  return (
                    <div
                      key={idx}
                      className="flex h-[140px] rounded-xl bg-primary-content shadow-xl"
                    >
                      <figure className="m-0 h-[140px] w-[100px] shrink-0 rounded-l-xl rounded-r-none">
                        <Image
                          src="/img/recipe_generic.jpg"
                          alt="Recipe"
                          width={200}
                          height={280}
                        />
                      </figure>
                      <div className="flex flex-shrink flex-grow flex-col items-start justify-start overflow-hidden px-1">
                        <div className="w-full">
                          <h3 className="m-0 truncate whitespace-nowrap">
                            {recipe.title}
                          </h3>
                        </div>
                        <div className="mb-2 h-full w-full overflow-scroll rounded-lg pl-1 pr-2 pt-2 shadow-inner">
                          <p className="m-0 text-xs font-thin">
                            {ingredTitles.join(", ") + "."}
                          </p>
                        </div>
                        {chosenRecipes.includes(recipe.id) ? (
                          <button
                            className="btn-error btn-sm btn mb-2 ml-auto mr-2 mt-auto w-[80px]"
                            onClick={() => {
                              setChosenRecipes((prev) =>
                                prev.filter((r) => r != recipe.id)
                              );
                              // handleRemoveRecipeProducts(recipe.id);
                            }}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="btn-success btn-sm btn mb-2 ml-auto mr-2 mt-auto w-[80px]"
                            onClick={() => {
                              handleChooseRecipe(recipe.id);
                              handleAddRecipeProducts(recipe.id);
                            }}
                          >
                            Choose
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Section>
            ) : (
              ""
            )}
            {section === "products" ? (
              <Section
                title="Tweak Products"
                nextSection="groceries"
                previousSection="recipes"
                setSection={setSection}
              >
                {chosenProduct.map((prod, idx) => {
                  return <div key={idx}>{prod.title}</div>;
                })}
              </Section>
            ) : (
              ""
            )}
            {section === "groceries" ? (
              <Section
                title="Share Grocery List"
                previousSection="products"
                setSection={setSection}
              >
                Stuff
              </Section>
            ) : (
              ""
            )}
          </>
        }
      />

      <FormCols2
        panel={
          <>
            <h2>Chosen Meals</h2>
            <div className="mb-4 flex h-full flex-col gap-4 overflow-scroll rounded-2xl border p-3 shadow-inner">
              {chosenRecipes.length <= 0 ? (
                <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                  No meals chosen
                </label>
              ) : (
                ""
              )}
              <ul className="m-0 pl-0">
                {recipes
                  .filter((recipe) => chosenRecipes.includes(recipe.id))
                  .map((recipe, idx) => (
                    <li
                      key={idx}
                      className="m-2 flex list-none flex-row rounded-lg border bg-primary-content p-3 text-lg font-bold"
                    >
                      <div className="flex-grow pl-3">{recipe.title}</div>
                      <button
                        className="btn-error btn-sm btn w-[80px]"
                        onClick={() =>
                          setChosenRecipes((prev) =>
                            prev.filter((r) => r != recipe.id)
                          )
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        }
      />
    </FormPage>
  );
}

export default Plan;
