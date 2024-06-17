const PaymentSchedule = require('../models/paymentschedule.models');
const Site = require('../models/site.models');
const Client = require('../models/client.models');

const getPaymentSchedules = async (req, res) => {
    try {
        const paymentschedules = await PaymentSchedule.find()
            .populate('site')
            .populate('client')
            .exec();

        if (paymentschedules.length === 0) return res.status(404).json({ error: 'No Payment Schedules Found' });
        return res.status(200).json(paymentschedules);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPaymentSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const paymentschedule = await PaymentSchedule.findById(id)
            .populate('site')
            .populate('client')
            .exec();
        if (!paymentschedule) return res.status(404).json({ error: 'Payment Schedule Not Found' });
        return res.status(200).json(paymentschedule);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const paymentScheduleBySite = async (req, res) => {
    try {
        const id = req.params.id;
        const paymentschedule = await PaymentSchedule.findOne({ site: id })
            .populate('site')
            .populate('client')
            .exec();
        if (!paymentschedule) return res.status(404).json({ error: 'Payment Schedule Not Found' });
        console.log(paymentschedule)
        return res.status(200).json(paymentschedule);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createPaymentSchedule = async (req, res) => {
    try {

        const {
            site,
            date,
            paymentDetails,
        } = req.body;
        // console.log(req.body);
        const existingSite = await Site.findById(site);
        const existingClient = await Client.findById(existingSite?.client);

        const newClientPaymentSchedule = new PaymentSchedule({
            client: existingClient._id,
            site,
            date,
            paymentDetails,
        });
        // console.log('client:', newClientPaymentSchedule);
        const clientPaymentSchedule = await newClientPaymentSchedule.save();
        if (!clientPaymentSchedule) return res.status(401).json({ error: 'Payment Schedule is not saved', error })
        existingSite.paymentSchedule = clientPaymentSchedule._id;
        await existingSite.save();
        return res.status(201).json({ message: 'Payment Schedule Created Successfuly', clientPaymentSchedule });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', error });
        console.log(error)
    }
};

const updatePaymentSchedule = async (req, res) => {
    try {
        const _id = req.params.id;
        const {
            site,
            client,
            paymentDetails: [{
                workDescription,
                amount,
                paymentDate,
            }],
        } = req.body;

        const existingPaymentSchedule = await PaymentSchedule.findById(_id);
        if (!existingPaymentSchedule) {
            return res.status(404).json({ error: 'Payment Schedule not found' });
        }

        existingPaymentSchedule.site = site || existingPaymentSchedule.site;
        existingPaymentSchedule.client = client || existingPaymentSchedule.client;
        // existingPaymentSchedule.remaningAmount = remaningAmount || existingPaymentSchedule.remaningAmount;
        // existingPaymentSchedule.amountPaid = amountPaid || existingPaymentSchedule.amountPaid;
        // existingPaymentSchedule.totalValue = totalValue || existingPaymentSchedule.totalValue;

        const newPaymentDetail = {
            workDescription,
            amount,
            paymentDate,
        };

        if (newPaymentDetail) {
            existingPaymentSchedule.paymentDetails.push(newPaymentDetail);
        }

        const updatedPaymentSchedule = await existingPaymentSchedule.save({ validateBeforeSave: false });

        if (!updatedPaymentSchedule) {
            return res.status(500).json({ error: 'Failed to update Payment Schedule' });
        }
        console.log(updatedPaymentSchedule);

        return res.status(200).json({ message: 'Payment Schedule updated successfully', updatedPaymentSchedule });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletePaymentSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedPaymentSchedule = await PaymentSchedule.findByIdAndDelete(id);
        if (!deletedPaymentSchedule) {
            return res.status(404).json({ error: 'Payment Schedule not found' });
        }
        res.status(200).json({ message: 'Payment Schedule deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPaymentDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const paymentschedule = await PaymentSchedule.findById( id )
            .populate('site')
            .populate('client')
            .exec();

        if (!paymentschedule && paymentschedule?.paymentDetails.length === 0) return res.status(404).json({ error: 'Payment Schedule Not Found' });
        const paymentDetail = paymentschedule.paymentDetails;
        return res.status(200).json(paymentDetail);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updatePaymentDetails = async (req, res) => {
    try {
        const _id = req.params.id;
        const index = req.params.index;
        const {
            workDescription,
            amount,
            paymentDate,
            status,
            paid,
            due,
        } = req.body;
        const paymentSchedule = await PaymentSchedule.findById({ _id });
        if (!paymentSchedule) {
            return res.status(404).json({ error: 'Payment Schedule not found' });
        }
        paymentSchedule.paymentDetails[index] = {
            workDescription,
            amount,
            paymentDate,
            status,
            paid,
            due,
        };
        await paymentSchedule.save();
        return res.status(200).json({ message: 'Payment Schedule updated successfully', paymentSchedule });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deletePaymentDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const existingPaymentSchedule = await PaymentSchedule.findById(id);

        if (!existingPaymentSchedule) {
            return res.status(404).json({ error: 'Project Schedule not found' });
        }

        existingPaymentSchedule.paymentDetails.splice(index, 1);
        await existingPaymentSchedule.save();
        const paymentSchedules = await PaymentSchedule.find()
            .populate('site')
            .populate('client')
            .exec();
        res.json({ message: 'Payment Detail Deleted Successfully', paymentSchedules, existingPaymentSchedule });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    getPaymentSchedule,
    getPaymentSchedules,
    createPaymentSchedule,
    updatePaymentSchedule,
    deletePaymentSchedule,
    deletePaymentDetails,
    updatePaymentDetails,
    getPaymentDetails,
    paymentScheduleBySite
};