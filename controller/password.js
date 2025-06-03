const Password = require("../models/password");
const { encrypt, decrypt } = require("../utils/crypto");

async function handleAddPassword(req, res) {
  const { site, username, password } = req.body;
  const encrypted = encrypt(password);

  if (req.body._id) {
    const result = await Password.findByIdAndUpdate(req.body._id, {
      site,
      username,
      password: encrypted.encryptedData,
      iv: encrypted.iv,
      createdBy : req.user._id
    });
    return res.status(200).json({ message: "Updated" });
  }

  const result = await Password.create({
    site,
    username,
    password: encrypted.encryptedData,
    iv: encrypted.iv,
    createdBy : req.user._id
  });
  if (result) {
    return res.status(201).json({ message: "Password Saved!" });
  }
}
async function handleDeletePassword(req, res) {
  const id = req.params.id;
  const result = await Password.findByIdAndDelete({ _id: id });
  if (result) {
    return res.status(200).json({ message: "Deleted" });
  }

  // const result = await Password.findByIdAndDelete({id})
  // return res.status(200).json({message : "Delete Got"})
}

async function handleGetAllPasswords(req, res) {

  const passwords = await Password.find({createdBy : req.user._id});

  if (passwords) {
    const decryptedEntries = passwords.map((entry) => ({
      ...entry._doc,
      password: decrypt({ encryptedData: entry.password, iv: entry.iv }),
    }));
    return res.status(200).json(decryptedEntries);
  } 
  else {
    return res.status(404).json({ message: "No passwords " });
  }
}

module.exports = {
  handleAddPassword,
  handleDeletePassword,
  handleGetAllPasswords,
};
