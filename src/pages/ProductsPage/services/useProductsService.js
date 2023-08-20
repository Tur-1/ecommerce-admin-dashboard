
import useToastNotification from "@/components/Toast/useToastNotification";
import { useLoadingSpinner } from '@/components/LoadingSpinner';
import { useConfirmModal } from "@/components/ConfirmModal";
import { FormStore } from "@/components/BaseForm";
import { appendFormData, isNotNull } from "@/helpers";
import useProductsApi from "@/pages/ProductsPage/api/useProductsApi";
import useProductAttributesService from "@/pages/ProductsPage/services/useProductAttributesService";
import useProductsStore from "@/pages/ProductsPage/stores/ProductsStore";

export default function useProductsService()
{

    const productsStore = useProductsStore();
    const getAllProducts = async () =>
    {

        let response = await useProductsApi.getAllProducts();

        productsStore.products = response.data.data;
        productsStore.paginationLinks = response.data.meta.pagination.links;

    }
    const storeNewProduct = async () =>
    {

        useLoadingSpinner.show();

        try
        {
            let response = await useProductsApi.storeNewProduct();

            await getAllProducts();

            useToastNotification.open().withMessage(response.data.message);


        } catch (error)
        {

            FormStore.setErrors(error);


        }
        useLoadingSpinner.hide();

    };
    const showProduct = async (id) =>
    {
        useLoadingSpinner.show();


        FormStore.clearErrors();


        let response = await useProductsApi.getProduct(id);

        FormStore.setFields(response.data.product);

        if (FormStore.fields.sizes.length == 0)
        {
            FormStore.fields.sizes.push({
                id: null,
                size_id: null,
                stock: null,
            });
        }
        if (isNotNull(FormStore.fields.section_id))
        {
            const { getAllCategoriesBySection } = useProductAttributesService();

            await getAllCategoriesBySection(FormStore.fields.section_id);
        }


        useLoadingSpinner.hide();



    };

    const updateProduct = async () =>
    {

        FormStore.showProgress();
        FormStore.clearErrors();


        try
        {

            const formData = appendFormData(FormStore.fields);

            let response = await useProductsApi.updateProduct({
                id: FormStore.fields.id,
                fields: formData
            });

            FormStore.setFields(response.data.product);

            useToastNotification.open().withMessage(response.data.message);
        } catch (error)
        {

            FormStore.setErrors(error);

        }

        FormStore.hideProgress();

    };
    const deleteProduct = async () =>
    {

        useConfirmModal.showLoading()
        let response = await useProductsApi.deleteProduct(productsStore.product_id.id);

        productsStore.products.splice(productsStore.product_id.index, 1);
        useConfirmModal.close();

        useToastNotification.open().withMessage(response.data.message);

        useConfirmModal.hideLoading()

    };
    const deleteProductImage = async (id) =>
    {

        useConfirmModal.showLoading()

        let response = await useProductsApi.deleteProductImage(id);

        useConfirmModal.close();

        useToastNotification.open().withMessage(response.data.message);

        useConfirmModal.hideLoading()

    };
    const changeProductMainImage = async (id) =>
    {

        useLoadingSpinner.show();

        let response = await useProductsApi.changeProductMainImage(id);

        useToastNotification.open().withMessage(response.data.message);

        useLoadingSpinner.hide();

    };
    const publishProduct = async (id, publish_value) =>
    {


        useLoadingSpinner.show();

        let response = await useProductsApi.publishProduct(id, publish_value);

        useToastNotification.open().withMessage(response.data.message);

        useLoadingSpinner.hide();

    };
    const openConfirmModal = ({ id, index }) =>
    {
        useConfirmModal.open();
        productsStore.product_id.id = id;
        roleStore.product_id.index = index;
    };
    return {
        updateProduct,
        storeNewProduct,
        getAllProducts,
        deleteProduct,
        deleteProductImage,
        showProduct,
        changeProductMainImage,
        publishProduct,
        openConfirmModal
    }

}