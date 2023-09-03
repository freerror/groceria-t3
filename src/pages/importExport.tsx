import FormCols2 from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";

interface GroceriaAppData {
  products: {
    id: string;
    section: { title: string };
    title: string;
    checkStock: boolean;
  }[];
  recipes: {
    title: string;
    id: string;
  }[];
  recipeToProduct: {
    recipeId: string;
    productId: string;
  }[];
}

let data: GroceriaAppData;

function ImportExport() {
  const recipeProducts = api.recipeRelations.getAll.useQuery().data || [];
  const recipes = api.recipe.getAll.useQuery().data || [];
  const products = api.product.getAll.useQuery().data || [];

  const createSections = api.section.createMany.useMutation({
    onSuccess: (res) => {
      console.log(`${res.count} sections created, adding products...`);
      handleCreateProducts();
    },
  });

  const createProducts = api.product.createMany.useMutation({
    onSuccess: (res) => {
      console.log(`${res.count} products created, adding recipes...`);
      handleCreateRecipes();
    },
  });

  const createRecipes = api.recipe.createMany.useMutation({
    onSuccess: (res) => {
      console.log(`${res.count} recipes created, done!`);
    },
  });

  function handleCreateSections() {
    const sections = data.products.map((product) => product.section.title);
    const uniqueSections = [...new Set(sections)];
    createSections.mutate(uniqueSections);
  }

  function handleCreateProducts() {
    const products = data.products.map((product) => ({
      title: product.title,
      sectionTitle: product.section.title,
      checkStock: product.checkStock,
    }));
    createProducts.mutate(products);
  }

  function handleCreateRecipes() {
    const recipes = data.recipes.map((recipe) => {
      const productTitles = data.recipeToProduct
        .filter((rel) => rel.recipeId === recipe.id)
        .map(
          (rel) =>
            data.products.find((product) => product.id === rel.productId)?.title
        );
      return {
        title: recipe.title,
        productTitles: productTitles as string[],
      };
    });
    createRecipes.mutate(recipes);
  }

  function handleExportData() {
    console.log("exporting data");
    const blob = new Blob(
      [
        JSON.stringify({
          recipes: recipes,
          products: products,
          recipeToProduct: recipeProducts,
        }),
      ],
      {
        type: "application/json",
      }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recipes.json";
    link.click();
  }

  function handleImportData(file: File) {
    console.log("importing data");
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result;
      data = JSON.parse(json as string) as GroceriaAppData;
      console.log("Raw data: ", data);
      handleCreateSections();
    };
    reader.readAsText(file);
  }

  return (
    <FormPage>
      <FormCols2
        panel={
          <div className="flex flex-col items-center">
            <h2 className="py-8 text-2xl">Import / Export</h2>
            <div className="flex flex-col items-start gap-4">
              <button
                className="btn-primary w-72 rounded-md p-5"
                onClick={handleExportData}
              >
                Export
              </button>
              <div className="btn-primary flex w-72 flex-row gap-3 rounded-md p-5 ">
                Import:
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files === null) return;
                    if (e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    if (file === undefined) return;
                    handleImportData(file);
                  }}
                />
              </div>
            </div>
          </div>
        }
      />
    </FormPage>
  );
}

export default ImportExport;
