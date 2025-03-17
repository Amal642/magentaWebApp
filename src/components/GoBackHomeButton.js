import { useNavigate } from "react-router-dom";

function GoBackHomeButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/owner-dashboard")} className="go-back-button">
      Go Back to Home
    </button>
  );
}

export default GoBackHomeButton;
