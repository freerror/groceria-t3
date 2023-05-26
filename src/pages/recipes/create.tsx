import { type Product } from "@prisma/client";
import { useState } from "react";
import FormCols2 from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";

function Create() {
  const [chosenProducts, setChosenProducts] = useState<Product[]>([]);
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const products = api.product.getAll.useQuery().data || [];
  const { data: recipes, refetch: refetchRecipes } =
    api.recipe.getAll.useQuery();
  const { data: recipeProducts, refetch: refetchRecipeProducts } =
    api.recipeRelations.getAll.useQuery();
  const deleteRecipe = api.recipe.delete.useMutation({
    onSuccess: async () => {
      await reload();
    },
  });
  const updateRecipe = api.recipe.update.useMutation({
    onSuccess: async () => {
      await reload();
    },
  });
  const createRecipe = api.recipe.create.useMutation({
    onSuccess: async () => {
      await reload();
    },
  });
  async function reload() {
    await refetchRecipes();
    await refetchRecipeProducts();
    resetForm();
  }
  function resetForm() {
    setEditRecipeId(null);
    setTitle("");
    setProductFilter("");
    setChosenProducts([]);
    setLoading(false);
  }

  function validateForm() {
    if (title && chosenProducts.length > 0 && !loading) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <FormPage>
      <FormCols2
        leftPanel={
          <>
            <h2 className="">Existing Recipes</h2>
            <div className="block h-[32rem] overflow-scroll rounded-md border bg-primary-content shadow-inner">
              <table className="m-0 w-full">
                <thead className="sticky top-0 shadow">
                  <tr>
                    <th className="bg-primary-content p-2">
                      <button className="font-bold">Recipe Title</button>
                    </th>
                  </tr>
                </thead>
                <tbody className="overflow-hidden">
                  {recipes?.map((recipe, idx) => (
                    <tr key={idx}>
                      <td className="p-1">
                        <button
                          className="justify-start truncate rounded-md border border-neutral-200 px-2 py-1 text-sm font-semibold normal-case hover:bg-neutral-100"
                          onClick={(_) => {
                            setEditRecipeId(recipe.id);
                            setTitle(recipe.title);
                            const productIds: string[] = [];
                            recipeProducts?.forEach((rel) => {
                              if (rel.recipeId === recipe.id) {
                                productIds.push(rel.productId);
                              }
                            });
                            setChosenProducts(
                              products.filter((prod) =>
                                productIds.includes(prod.id)
                              )
                            );
                          }}
                        >
                          {recipe.title}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        }
        rightPanel={
          <div className="items grid h-full grid-cols-1 items-start gap-2">
            <h2 className="mt-0">{editRecipeId ? "Edit" : "Create"} Recipe</h2>
            <label className="input-group-md input-group w-full">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Veggie Burger with Avocado and Tomato Salsa"
                className="input-bordered input input-md w-full"
              />
            </label>
            <div className="rounded-lg border">
              <div className="rounded-t-lg bg-neutral-200 p-2">
                <label className="prose-sm">
                  Select products on the left to include in the recipe.<br></br>
                </label>
              </div>
              <div className="m-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="block h-[15rem] overflow-scroll rounded-md border bg-primary-content shadow-inner">
                  <table className="m-0 w-full">
                    <thead className="sticky top-0 shadow">
                      <tr>
                        <th className="flex justify-between bg-primary-content p-2">
                          <button className="font-bold">Products</button>
                          <input
                            type="text"
                            value={productFilter}
                            onChange={(e) =>
                              setProductFilter(e.target.value.toLowerCase())
                            }
                            placeholder="filter"
                            className="select-accent mr-1 w-[4rem] overflow-clip rounded-md border px-1"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="overflow-hidden">
                      {products
                        ?.filter((prod) =>
                          prod.title.toLowerCase().includes(productFilter)
                        )
                        .filter((prod) => !chosenProducts.includes(prod))
                        .map((product, idx) => (
                          <tr key={idx}>
                            <td className="p-1">
                              <button
                                onClick={(_) => {
                                  setChosenProducts((prev) => {
                                    if (prev.includes(product)) {
                                      return prev;
                                    }
                                    return [...prev, product];
                                  });
                                }}
                                className="max-w-[9rem] rounded-md border border-neutral-200 px-2 py-1 text-left text-sm font-semibold normal-case hover:bg-neutral-100"
                              >
                                {product.title}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="block h-[15rem] overflow-scroll rounded-md border bg-primary-content shadow-inner">
                  <table className="m-0 w-full">
                    <thead className="sticky top-0 shadow">
                      <tr>
                        <th className="bg-primary-content p-2">
                          <button className="font-bold">Chosen Products</button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="overflow-hidden">
                      {chosenProducts.map((product, idx) => (
                        <tr key={idx}>
                          <td className="h-max p-1">
                            <button
                              onClick={() => {
                                setChosenProducts((prev) =>
                                  prev.filter((prod) => prod.id !== product.id)
                                );
                              }}
                              className="max-w-[10rem] justify-start truncate rounded-md border border-neutral-200 px-2 py-1 text-sm font-semibold normal-case hover:bg-neutral-100"
                            >
                              {product.title}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <button
              className="btn-success btn w-full"
              disabled={!validateForm()}
              onClick={(_) => {
                setLoading(true);
                if (editRecipeId) {
                  updateRecipe.mutate({
                    id: editRecipeId,
                    title,
                    productIds: chosenProducts.map((p) => p.id),
                  });
                } else {
                  createRecipe.mutate({
                    title,
                    productIds: chosenProducts.map((p) => p.id),
                  });
                }
              }}
            >
              Save
            </button>
            <div className="flex flex-row justify-between self-end">
              <button
                className="btn-error btn"
                disabled={!validateForm() || !editRecipeId}
                onClick={() => {
                  setLoading(true);
                  editRecipeId !== null &&
                    deleteRecipe.mutate({ id: editRecipeId });
                }}
              >
                Delete
              </button>
              <button
                className="btn-warning btn"
                onClick={() => {
                  resetForm();
                }}
                disabled={!validateForm()}
              >
                Cancel
              </button>
            </div>
          </div>
        }
      />
    </FormPage>
  );
}

export default Create;
