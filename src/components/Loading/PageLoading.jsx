import "./PageLoading.css";

const PageLoading = ({ message = "Loading..." }) => {
  return (
    <div className="page_loading_container">
      <div className="page_loading_content">
        <div className="page_loading_spinner"></div>
        <p className="page_loading_message">{message}</p>
      </div>
    </div>
  );
};

export default PageLoading;
