import { initialValues } from "../../utils/constant";
import Form from "../../Form";
import { observer } from "mobx-react-lite";
import CustomDrawer from "../../../../../component/common/Drawer/CustomDrawer";

const AddPatientDrawer = observer(({
  isDrawerOpen,
  setIsDrawerOpen,
  handleAddSubmit,
  handleEditSubmit,
  thumbnail,
  setThumbnail,
  formLoading,
  getAllUsers,
}: any) => {
  return (
    <CustomDrawer
      open={isDrawerOpen.isOpen}
      close={() =>
        setIsDrawerOpen({ isOpen: false, type: "add", data: null })
      }
      title={isDrawerOpen?.type === "edit" ? "Edit Patient" : "Add Patient"}
      width="75vw"
    >
      <Form
        initialData={
          isDrawerOpen?.type === "edit"
            ? { ...initialValues, ...isDrawerOpen?.data }
            : initialValues
        }
        onSubmit={
          isDrawerOpen?.type === "edit"
            ? handleEditSubmit
            : handleAddSubmit
        }
        isOpen={isDrawerOpen}
        onClose={() =>
          setIsDrawerOpen({ isOpen: false, type: "add", data: null })
        }
        thumbnail={thumbnail}
        isEdit={isDrawerOpen.type === "edit" ? true : false}
        setThumbnail={setThumbnail}
        loading={formLoading}
        getAllUsers={getAllUsers}
      />
    </CustomDrawer>
  );
});

export default AddPatientDrawer;