const fy = require("../services/ERP/fiscalYear.service.js");

exports.create = async (req, res) => {

    const fy =
        await fy.createFiscalYear(
            req.body,
            req.user
        );

    res.status(201)
        .json(fy);

};

exports.get = async (
    req,
    res
) => {

    const data =
        await fy.getFY(
            req.query.company
        );

    res.json(data);

};

exports.close = async (
    req,
    res
) => {

    res.json(
        await fy.closeFY(
            req.params.id
        )
    );

};

exports.reopen = async (
    req,
    res
) => {

    res.json(
        await fy.reopenFY(
            req.params.id
        )
    );

};

exports.remove = async (
    req,
    res
) => {

    await fy.deleteFY(
        req.params.id
    );

    res.json({
        message:
            "Deleted"
    });

};