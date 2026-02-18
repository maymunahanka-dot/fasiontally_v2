import "./Loading.css";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading_container">
      <div className="loading_content">
        <div className="loading_spinner_wrapper">
          <div className="loading_spinner_inner"></div>
        </div>
        <p className="loading_message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
