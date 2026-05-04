import { Typography } from "antd";

const { Title } = Typography;

const HeaderLogin = ({ text, logo, height, isTablet }) => {
  return (
    <div
      style={{
        width: "100%",
        height: height,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "start",
        gap: "16px",
        backgroundColor: "var(--background-color)",
        padding: isTablet ? "0 16px" : "0 24px",
        boxSizing: "border-box"
      }}
    >
      <img
        src={logo}
        alt="Logo"
        style={{
          width: isTablet ? "40px" : "60px",
          height: isTablet ? "40px" : "60px",
          objectFit: "cover",
          borderRadius: "50%",
          marginLeft: isTablet ? 10 : 20
        }}
      />

      <Title
        level={isTablet ? 4 : 2}
        style={{
          marginLeft: 16,
          color: "#313131",
          margin: 0,
          display: "flex",
          alignItems: "center"
        }}
      >
        {text}
      </Title>
    </div>
  );
};

export default HeaderLogin;