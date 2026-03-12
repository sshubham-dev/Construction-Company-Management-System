const { LabourAttendance } = require("../models/attendance.models");
const Contractor = require("../models/contractor.models");
const Site = require("../models/site.models");
const User = require("../models/user.models");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");

const getLabourAttendances = async (req, res) => {
  try {
    const labourAttendances = await LabourAttendance.find()
      .sort({ createdAt: -1 })
      .exec();
    if (labourAttendances.length === 0)
      return res.status(404).json({ message: "No Labour Attendance Found" });
    return res.status(201).json(labourAttendances);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getLabourAttendance = async (req, res) => {
  try {
    const labourAttendance = await LabourAttendance.findById(
      req.params.id,
    ).exec();
    if (!labourAttendance)
      return res.status(404).json({ message: "Labour Attendance Not Found" });
    return res.status(201).json(labourAttendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getSiteLabourAttendance = async (req, res) => {
  try {
    const { site } = req.params;
    const labourAttendance = await LabourAttendance.find()
      .where("site.id")
      .equals(site)
      .exec();
    if (!labourAttendance)
      return res.status(404).json({ message: "Labour Attendance Not Found" });
    return res.status(201).json(labourAttendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const createLabourAttendance = async (req, res) => {
  try {
    const {
      site,
      contractor,
      skilledMale = 0,
      skilledFemale = 0,
      unskilledMale = 0,
      unskilledFemale = 0,
      skilledMaleRate = 0,
      skilledFemaleRate = 0,
      unskilledMaleRate = 0,
      unskilledFemaleRate = 0,
      work,
    } = req.body;
    const user = req.user;

    const existingSite = await Site.findById(site);
    if (!existingSite) {
      return res.status(404).json({ message: "Site not found" });
    }

    let contractorId = null;
    let contractorName = contractor;

    // If contractor is not Supply Labour then check in DB
    if (contractor !== "Supply Labour") {
      const existingContractor = await Contractor.findById(contractor);
      if (!existingContractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      contractorId = existingContractor._id;
      contractorName = existingContractor.name;
    }

    if (
      skilledMale == 0 &&
      skilledFemale == 0 &&
      unskilledMale == 0 &&
      unskilledFemale == 0
    ) {
      return res.status(400).json({
        message: "At least one labour count must be greater than zero",
      });
    }

    const attendance = new LabourAttendance({
      site: {
        id: existingSite._id,
        name: existingSite.name,
      },
      contractor: contractorName,
      contractorId,
      skilledMale,
      skilledFemale,
      unskilledMale,
      unskilledFemale,
      skilledMaleRate,
      skilledFemaleRate,
      unskilledMaleRate,
      unskilledFemaleRate,
      work,
    });

    const savedAttendance = await attendance.save();
    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
      sendPushNotification(
        employee?._id,
        `${user.userName} has created Labour Report for ${existingSite.name}`,
      );
      employee.notification.push({
        title: "Labour Report Alert",
        message: `Labour Report raised by ${user.userName} for ${existingSite.name}`,
        createdAt: savedAttendance.createdAt
          ? savedAttendance.createdAt
          : new Date(),
        link: `/sites/labour-attendance`,
      });
      await employee.save();
    }
    return res.status(201).json(savedAttendance);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateLabourAttendance = async (req, res) => {
  try {
    const {
      // site,
      // contractor,
      skilledMale = 0,
      skilledFemale = 0,
      unskilledMale = 0,
      unskilledFemale = 0,
      skilledMaleRate = 0,
      skilledFemaleRate = 0,
      unskilledMaleRate = 0,
      unskilledFemaleRate = 0,
      work,
    } = req.body;
    const existingLabourAttendance = await LabourAttendance.findById(
      req.params.id,
    ).exec();

    if (!existingLabourAttendance)
      return res.status(404).json({ message: "Labour Attendance Not Found" });

    // const existingSite = await Site.findById(site);
    // if (!existingSite) {
    //   return res.status(404).json({ message: "Site not found" });
    // }

    // let contractorId = null;
    // let contractorName = contractor;

    // // If contractor is not Supply Labour then check in DB
    // if (contractor !== "Supply Labour") {
    //   const existingContractor = await Contractor.findById(contractor);
    //   if (!existingContractor) {
    //     return res.status(404).json({ message: "Contractor not found" });
    //   }
    //   contractorId = existingContractor._id;
    //   contractorName = existingContractor.name;
    // }

    ((existingLabourAttendance.site = existingLabourAttendance.site),
      (existingLabourAttendance.contractor =
        existingLabourAttendance.contractor),
      (existingLabourAttendance.contractorId =
        existingLabourAttendance.contractorId),
      (existingLabourAttendance.skilledFemale = skilledFemale));
    existingLabourAttendance.skilledFemaleRate = skilledFemaleRate;
    existingLabourAttendance.unskilledFemale = unskilledFemale;
    existingLabourAttendance.unskilledFemaleRate = unskilledFemaleRate;
    existingLabourAttendance.skilledMale = skilledMale;
    existingLabourAttendance.skilledMaleRate = skilledMaleRate;
    existingLabourAttendance.unskilledMale = unskilledMale;
    existingLabourAttendance.unskilledMaleRate = unskilledMaleRate;
    existingLabourAttendance.work = work;

    await existingLabourAttendance.save();
    return res.status(201).json(existingLabourAttendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const deleteLabourAttendance = async (req, res) => {
  try {
    const deletedLabourAttendance = await LabourAttendance.findByIdAndDelete(
      req.params.id,
    ).exec();
    if (!deletedLabourAttendance)
      return res.status(404).json({ message: "Labour Attendance Not Found" });
    return res
      .status(201)
      .json({ message: "Labour Attendance Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

module.exports = {
  getLabourAttendances,
  getLabourAttendance,
  createLabourAttendance,
  updateLabourAttendance,
  deleteLabourAttendance,
  getSiteLabourAttendance,
};
