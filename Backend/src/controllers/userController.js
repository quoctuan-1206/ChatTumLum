export const authMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      message: "Authenticated user info",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Error in authMe:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
