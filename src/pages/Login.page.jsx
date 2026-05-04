import { useState, useEffect } from "react";
import { Layout } from "antd";
import { motion } from "framer-motion";

import HeaderLogin from "../components/ui/Login/Header.login";
import FormLogin from "../components/ui/Login/Form.login";
import ImageLogin from "../components/ui/Login/Image.login";

import imagen from "../assets/img_login.png";
import Logo from "../assets/logos/logo.png";

const { Header, Content } = Layout;

const useResponsive = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsTablet(window.innerWidth <= 1024 || window.innerHeight <= 700);
    };

    checkResponsive();
    window.addEventListener("resize", checkResponsive);

    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  return isTablet;
};

const LoginPage = () => {
  const isTablet = useResponsive();
  const headerHeight = isTablet ? "70px" : "90px";

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "var(--background-color)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <Header style={{ padding: 0, height: headerHeight, lineHeight: headerHeight }}>
        <HeaderLogin text="Pizza El Jaguar" logo={Logo} height={headerHeight} isTablet={isTablet} />
      </Header>

      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: isTablet ? "start" : "center",
          padding: isTablet ? "16px" : "32px",
          height: `calc(100vh - ${headerHeight})`,
          backgroundColor: "var(--background-color)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isTablet ? "900px" : "1400px",
            display: "flex",
            gap: isTablet ? "20px" : "40px",
            height: isTablet ? "80%" : "70vh",
            maxHeight: "800px",
            backgroundColor: "transparent",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: isTablet ? "100%" : "700px",
                height: "100%",
                display: "flex",
                alignContent: "start",
                justifyContent: "end",
                backgroundColor: "transparent",
              }}
            >
              <FormLogin isTablet={isTablet} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              backgroundColor: "transparent",
            }}
            className="image-section"
          >
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                height: "100%",
              }}
            >
              <ImageLogin image={imagen} />
            </div>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;