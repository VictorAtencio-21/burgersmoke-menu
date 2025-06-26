import Menu from "@/components/screens/Menu";
import { fetchMenu } from "@/lib/actions/fetchMenu";

async function MenuPage() {
	const fetchedMenu = await fetchMenu();

	if (!fetchedMenu || fetchedMenu.length === 0) {
		return <div className="text-white">No hay elementos del menú disponibles.</div>;
	}

	return <Menu menu={fetchedMenu} />;
}

// Export the MenuPage component
export default MenuPage;
