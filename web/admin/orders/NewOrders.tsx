import AdminOrders from "../Orders";

const NewOrders = () => {
  return (
    <AdminOrders 
      excludeStatuses={["delivered", "cancelled"]}
    />
  );
};

export default NewOrders;
