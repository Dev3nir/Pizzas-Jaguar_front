import { Typography } from "antd";

const { Title } = Typography;

const HeaderComponent = ({ text, logo, height = "80px", isTablet }) => {
  return (
    <div
      style={{
        width: "100%",
        height: height,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", 
        backgroundColor: "#435540", 
        paddingLeft: isTablet ? "20px" : "32px", 
        paddingRight: "0px", 
        boxSizing: "border-box",
        overflow: "hidden" 
      }}
    >
      <Title
        level={isTablet ? 4 : 3}
        style={{
          color: "#FFFFFF", 
          margin: 0,
          display: "flex",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "30px",
          letterSpacing: "2px",
          textTransform: "uppercase" 
        }}
      >
        {text}
      </Title>

    
      <div 
        style={{ 
          height: "100%", 
          display: "flex", 
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "100%", 
            width: "auto",
            minWidth: isTablet ? "80px" : "120px", 
            objectFit: "cover",
   
          }}
        />
      </div>
    </div>
  );
};

export default HeaderComponent;