import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import {
  calculateBMR,
  calculateTDEE,
  ACTIVITY_LABELS,
} from "../../../utils/nutrition";
import { NotificationService } from "../../../services/notificationService";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Stack,
  Checkbox,
  FormGroup,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function Profile() {
  const { profile, updateUserProfile, logout } = useAuth();
  const showToast = useToast();

  const [form, setForm] = useState({
    name: profile?.name || "",
    age: profile?.age || 25,
    weight: profile?.weight || 70,
    height: profile?.height || 170,
    gender: profile?.gender || "male",
    activityLevel: profile?.activityLevel || "sedentary",
    dailyGoal: profile?.dailyGoal || 2000,
    dailyWaterGoal: profile?.dailyWaterGoal || 2500,
    reminders: profile?.reminders || {
      enabled: false,
      intervalHours: 3,
      startHour: 8,
      endHour: 22,
      remindWater: true,
      remindFood: true,
    },
    fcmTokens: profile?.fcmTokens || [],
  });

  const handleCalculate = () => {
    const bmr = calculateBMR(form.weight, form.height, form.age, form.gender);
    const tdee = calculateTDEE(bmr, form.activityLevel);

    // Recommend water goal: weight * 35 ml
    const recommendedWater = Math.round(form.weight * 35);
    // Add 500ml extra if active/veryActive
    const activityBonus =
      form.activityLevel === "active" || form.activityLevel === "veryActive"
        ? 500
        : 0;
    const finalWaterGoal = recommendedWater + activityBonus;

    setForm((p) => ({ ...p, dailyGoal: tdee, dailyWaterGoal: finalWaterGoal }));
    showToast(
      `BMR, TDEE ve Su Hedefi hesaplandı! Kalori: ${tdee} kcal, Su: ${finalWaterGoal} ml 🎯`,
      "info",
    );
  };

  const handleReminderToggle = async (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const token = await NotificationService.requestPermissionAndGetToken();
      if (token) {
        setForm((p) => ({
          ...p,
          reminders: { ...p.reminders, enabled: true },
          fcmTokens: p.fcmTokens.includes(token)
            ? p.fcmTokens
            : [...p.fcmTokens, token],
        }));
        showToast(
          "Bildirimler aktif hale getirildi! 🔔 Lütfen ayarları kaydedin.",
          "success",
        );
      } else {
        setForm((p) => ({
          ...p,
          reminders: { ...p.reminders, enabled: false },
        }));
        showToast(
          "Tarayıcı bildirim izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.",
          "error",
        );
      }
    } else {
      setForm((p) => ({
        ...p,
        reminders: { ...p.reminders, enabled: false },
      }));
      showToast("Bildirimler kapatıldı.", "info");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(form);
      showToast("Profil güncellendi! 🎉", "success");
    } catch {
      showToast("Güncelleme sırasında hata oluştu", "error");
    }
  };

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      <Typography
        variant="h5"
        fontWeight="900"
        mb={3}
        sx={{
          background: "var(--gradient-hero)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Profil & Hedefler
      </Typography>

      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Kişisel Bilgiler */}
          <Card
            sx={{
              borderRadius: "12px",
              bgcolor: "rgba(22, 26, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight="800"
                mb={3}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ letterSpacing: "-0.01em" }}
              >
                <PersonIcon color="primary" /> Kişisel Bilgiler
              </Typography>

              <Stack>
                <Stack direction="row">
                  <TextField
                    label="Ad Soyad"
                    variant="outlined"
                    fullWidth
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    label="Boy (cm)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={form.height}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        height: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                    inputProps={{ min: 0, style: { minWidth: 0 } }}
                  />
                  <TextField
                    label="Kilo (kg)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={form.weight}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        weight: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                    inputProps={{ min: 0, style: { minWidth: 0 } }}
                  />
                </Stack>
                <Stack direction={"row"} spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    label="Yaş"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={form.age}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        age: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                    inputProps={{ min: 0, style: { minWidth: 0 } }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Cinsiyet</InputLabel>
                    <Select
                      value={form.gender}
                      label="Cinsiyet"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      <MenuItem value="male">Erkek</MenuItem>
                      <MenuItem value="female">Kadın</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Aktivite Düzeyi */}
          <Card
            sx={{
              borderRadius: "12px",
              bgcolor: "rgba(22, 26, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight="800"
                mb={3}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ letterSpacing: "-0.01em" }}
              >
                <FitnessCenterIcon color="primary" /> Aktivite Düzeyi
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Aktivite Seviyesi</InputLabel>
                <Select
                  value={form.activityLevel}
                  label="Aktivite Seviyesi"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, activityLevel: e.target.value }))
                  }
                >
                  {Object.entries(ACTIVITY_LABELS).map(([k, label]) => (
                    <MenuItem key={k} value={k}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleCalculate}
                sx={{ mt: 3, borderRadius: 999, py: 1.5, fontWeight: "bold" }}
              >
                BMR & TDEE ile Kalori Hesapla 🎯
              </Button>
            </CardContent>
          </Card>

          {/* Günlük Hedefler */}
          <Card
            sx={{
              borderRadius: "12px",
              bgcolor: "rgba(22, 26, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight="800"
                mb={3}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ letterSpacing: "-0.01em" }}
              >
                <EmojiEventsIcon color="primary" /> Günlük Hedefler
              </Typography>
              <TextField
                label="Günlük Kalori Hedefi (kcal)"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={form.dailyGoal}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    dailyGoal: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
              <TextField
                label="Günlük Su Hedefi (ml)"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={form.dailyWaterGoal}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    dailyWaterGoal: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </CardContent>
          </Card>

          {/* Hatırlatıcı Ayarları */}
          <Card
            sx={{
              borderRadius: "12px",
              bgcolor: "rgba(22, 26, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <NotificationsActiveIcon color="primary" /> Bildirimler
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Su içme ve yemek yeme hatırlatıcılarını al
                  </Typography>
                </Box>
                <Switch
                  checked={form.reminders?.enabled || false}
                  onChange={handleReminderToggle}
                  color="primary"
                />
              </Box>

              {form.reminders?.enabled && (
                <Stack spacing={2} mt={2}>
                  <FormControl fullWidth>
                    <InputLabel>Hatırlatma Sıklığı</InputLabel>
                    <Select
                      value={form.reminders?.intervalHours || 3}
                      label="Hatırlatma Sıklığı"
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          reminders: {
                            ...p.reminders,
                            intervalHours: parseInt(e.target.value) || 3,
                          },
                        }))
                      }
                    >
                      <MenuItem value={1}>Her saat başı</MenuItem>
                      <MenuItem value={2}>2 saatte bir</MenuItem>
                      <MenuItem value={3}>3 saatte bir</MenuItem>
                      <MenuItem value={4}>4 saatte bir</MenuItem>
                      <MenuItem value={6}>6 saatte bir</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      label="Başlangıç Saati"
                      type="number"
                      inputProps={{ min: 0, max: 23, style: { minWidth: 0 } }}
                      fullWidth
                      value={form.reminders?.startHour ?? 8}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          reminders: {
                            ...p.reminders,
                            startHour: Math.max(
                              0,
                              Math.min(23, parseInt(e.target.value) || 0),
                            ),
                          },
                        }))
                      }
                    />
                    <TextField
                      label="Bitiş Saati"
                      type="number"
                      inputProps={{ min: 0, max: 23, style: { minWidth: 0 } }}
                      fullWidth
                      value={form.reminders?.endHour ?? 22}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          reminders: {
                            ...p.reminders,
                            endHour: Math.max(
                              0,
                              Math.min(23, parseInt(e.target.value) || 0),
                            ),
                          },
                        }))
                      }
                    />
                  </Stack>

                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.reminders?.remindWater ?? true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              reminders: {
                                ...p.reminders,
                                remindWater: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="💧 Su İçme Hatırlatıcısı"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.reminders?.remindFood ?? true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              reminders: {
                                ...p.reminders,
                                remindFood: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="🍎 Yemek Yeme Hatırlatıcısı"
                    />
                  </FormGroup>

                  <Button
                    variant="outlined"
                    color="info"
                    fullWidth
                    onClick={() => {
                      NotificationService.sendTest();
                      showToast("Test bildirimi gönderildi! 🚀", "success");
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Test Bildirimi Gönder 🚀
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<SettingsIcon />}
            sx={{ borderRadius: 3, py: 1.5, fontWeight: "bold" }}
          >
            Değişiklikleri Kaydet ✨
          </Button>

          <Button
            variant="text"
            color="error"
            fullWidth
            onClick={() => {
              logout();
              showToast("Çıkış yapıldı.", "info");
            }}
            startIcon={<ExitToAppIcon />}
            sx={{ mt: 1, fontWeight: "bold" }}
          >
            Çıkış Yap 🚪
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
