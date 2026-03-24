import { Box, Button, Typography } from '@mui/material'
import { FormatDate, formatDateTime } from '@utils/date';
import React from 'react'

interface BookingData {
    id: string
    roomId: string;
    checkinDate: string;
    checkoutDate: string;
    guestNumber: number;
    childrenNumber: number | null;
    additionGuestNumber: number | null;
    name: string;
    phoneNumber: string;
    totalPrice: string;
    status: string;
    remark?: string;
}
interface BookManagementCardProps {
    bookingData: BookingData[]
    onClick: (id: string) => void

}
function BookManagementCard({ bookingData, onClick }: BookManagementCardProps) {
    const ColorStatus = (status: string) => {
        switch (status) {
            case "Pending":
                return "#aea3a4ff"
            case "Confirmed":
                return "#42c946ff"

            default:
            // code block
        }
    }
    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', pl: 4 }}>
                {bookingData.map((item, index) => (
                    <Box key={index} sx={{ border: '1px solid #984444ff', p: 2, width: '350px', flexShrink: 0, flexGrow: 0 }}>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                เลขอ้างอิง:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.roomId}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                วันเข้าพัก:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {FormatDate(item.checkinDate)}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                วันออกพัก:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {FormatDate(item.checkoutDate)}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                ผู้ใหญ่:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.guestNumber} คน{item.childrenNumber ? ` + เด็ก ${item.childrenNumber}` : ''}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                ผู้เข้าพักเพิ่ม:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.additionGuestNumber ?? '-'}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                ชื่อ:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.name}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                เบอร์โทร:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.phoneNumber}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                ราคารวม:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.totalPrice} บาท
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems={"center"}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                สถานะ:
                            </Typography>
                            <Box sx={{ backgroundColor: ColorStatus(item.status),p:1, borderRadius: '24px' }} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                {item.status}
                            </Box>
                            {item.status === "Pending" && (
                                <Button variant="contained" color="primary" onClick={() => onClick(item.id)} sx={{ borderRadius: '24px' }}>
                                    confirm
                                </Button>
                            )}
                        </Box>
                        {item.remark && (
                            <Box display="flex" gap={2} mt={1}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', color: 'text.secondary' }}>
                                    หมายเหตุ:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                    {item.remark}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default BookManagementCard