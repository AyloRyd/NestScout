import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Statistics from '../models/Statistics.js';

class StatisticsController {
    static async getStatisticsPage(req, res) {
        try {
            const hostId = req.params.userId;

            const hostStatistics = await Statistics.getHostStatistics(hostId);
            const cityStatistics = await Statistics.getCityStatistics();
            const allHostsStatistics = await Statistics.getAllHostsStatistics();
            const propertyTypeStatistics = await Statistics.getPropertyTypeStatistics();

            const statistics = [
                {
                    title: 'Your host statistics',
                    columns: ['Listing title', 'Total earnings', 'Total bookings', 'Average booking duration'],
                    data: hostStatistics,
                },
                {
                    title: 'Cities statistics',
                    columns: ['City', 'Average price per night', 'Total listings', 'Total bookings'],
                    data: cityStatistics,
                },
                {
                    title: 'All hosts statistics',
                    columns: ['Host name', 'Total listings', 'Total earnings', 'Average booking duration'],
                    data: allHostsStatistics,
                },
                {
                    title: 'Property type popularity',
                    columns: ['Property type', 'Average booking price', 'Total bookings', 'Total earnings'],
                    data: propertyTypeStatistics,
                },
            ];

            res.render('statistics/statistics-page', { statistics, userId: hostId });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).send('Failed to fetch statistics');
        }
    }

    static async downloadStatisticsPDF(req, res) {
        try {
            const hostId = req.params.userId;

            const aggregateStatistics = await Statistics.getHostAggregateStatistics(hostId);

            const downloadsFolder = path.join(process.cwd(), 'downloads');
            if (!fs.existsSync(downloadsFolder)) {
                fs.mkdirSync(downloadsFolder, { recursive: true });
            }
            const pdfPath = path.join(downloadsFolder, `Host_aggregate_statistics_${hostId}.pdf`);

            const doc = new PDFDocument();
            const pdfStream = fs.createWriteStream(pdfPath);

            doc.pipe(pdfStream);

            doc.fontSize(24).text('Host aggregate statistics');
            doc.moveDown();
            doc.fontSize(16).text(`Total Earnings: $${aggregateStatistics.total_earnings || 0}`, { align: 'left' });
            doc.text(`Total bookings: ${aggregateStatistics.total_bookings || 0}`, { align: 'left' });
            doc.text(`Average booking duration: ${aggregateStatistics.avg_booking_duration || 0} days`, { align: 'left' });
            doc.moveDown();
            doc.fontSize(12).text(`Report generated on: ${new Date().toLocaleDateString('uk-UA')}`, { align: 'left' });
            doc.end();

            pdfStream.on('finish', () => {
                res.download(pdfPath, `Host_Aggregate_Statistics_${hostId}.pdf`, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                        res.status(500).send('Failed to download the report.');
                    }

                    fs.rm(downloadsFolder, { recursive: true, force: true }, (removeErr) => {
                        if (removeErr) {
                            console.error(`Failed to remove folder: ${downloadsFolder}`, removeErr);
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Failed to generate the PDF report');
        }
    }
}

export default StatisticsController;
