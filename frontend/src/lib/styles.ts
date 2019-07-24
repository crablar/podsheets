export const colors = {
    highlight: "#2185D0",
    highLightInverted: "#ffffff",
    mainDark: "#3D3E8B",
    mainLight: "#635E94",
    mainXLight: "#ACA5EB",
    mainULight: "#DFDEEC",
    mainVibrant: "#A471CC",
    mainLVibrant: "#9833ce",
    mainGrey: "#525354",
    positive: "#73CAA2",
    negative: "#E83E67",
};

export const globalStyles = {
    contentWrapper: {
        display: "flex",
        flex: 1,
    },
    title: {
        cursor: "pointer",
        textAlign: "left",
        color: colors.mainDark,
        whiteSpace: "nowrap",
        overflow: "hidden" as "hidden",
        textOverflow: "ellipsis",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    workspaceContent: {
        flex: 1,
        padding: "30px 40px 20px",
    },
    workspaceContentText: {
        color: colors.mainDark,
        fontSize: "110%",
    },
    text : {
        color: colors.mainDark,
    },
    link: {
        color: colors.highlight,
        underline: "none",
    },
    linkInverted: {
        color: colors.mainDark,
        underline: "none",
    },
    linkInvertedLight:
    {
        color: "#ffffff",
        underline: "none",
    },
    tooltip: {
        backgroundColor: colors.mainDark,
        color: "white",
        padding: 0,
        paddingLeft: 10,
        paddingRight: 10,
        borderColor: "black",
        borderRadius: 0,
        fontSize: "90%",
    },
    mainButton: {
        backgroundColor: colors.mainDark,
        color: "white",
    },
};

export const theme = {
    light: {
        backgroundColor: "white",
    },
    dark: {
        backgroundColor: "black",
    },
    sky: {
        backgroundColor: "#B2D3FD",
    },
    silver: {
        backgroundColor: "#CDC9C9",
    },
    sand: {
        backgroundColor: "#EDECE7",
    },
};
