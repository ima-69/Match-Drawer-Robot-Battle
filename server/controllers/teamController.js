import Team from "../models/Team.js";

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const logoUrl = req.file?.path;
    const team = new Team({ name, logoUrl });
    await team.save();
    res.status(201).json({ message: "Team created", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json({ message: "Team deleted successfully", teamId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};