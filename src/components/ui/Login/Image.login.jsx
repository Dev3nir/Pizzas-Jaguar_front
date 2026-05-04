const ImageLogin = ({ image }) => {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                maxWidth: "800px",
                borderRadius: "30px",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                backgroundColor: "#f5f5f5",
            }}
        >
            <img
                src={image}
                alt="Login"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        </div>
    );
};

export default ImageLogin;