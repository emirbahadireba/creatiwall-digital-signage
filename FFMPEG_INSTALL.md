# FFmpeg Kurulum Rehberi (Windows)

FFmpeg, video thumbnail'ları oluşturmak için gereklidir. Aşağıdaki yöntemlerden birini kullanarak FFmpeg'i yükleyebilirsiniz.

## Yöntem 1: Chocolatey ile (Önerilen)

1. Chocolatey'yi yükleyin (yönetici olarak PowerShell'de):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

2. FFmpeg'i yükleyin:
```powershell
choco install ffmpeg
```

## Yöntem 2: Manuel Kurulum (Daha Kolay)

1. FFmpeg'i indirin:
   - https://www.gyan.dev/ffmpeg/builds/ adresine gidin
   - "ffmpeg-release-essentials.zip" dosyasını indirin

2. ZIP dosyasını açın (örneğin `C:\ffmpeg` klasörüne)

3. Sistem PATH'ine ekleyin:
   - Windows tuşu + R → `sysdm.cpl` yazın → Enter
   - "Gelişmiş" sekmesi → "Ortam Değişkenleri"
   - "Sistem değişkenleri" altında "Path" seçin → "Düzenle"
   - "Yeni" → `C:\ffmpeg\bin` ekleyin
   - Tüm pencereleri "Tamam" ile kapatın

4. Yeni bir terminal açın ve test edin:
```powershell
ffmpeg -version
```

## Yöntem 3: Scoop ile

1. Scoop'u yükleyin (PowerShell'de):
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

2. FFmpeg'i yükleyin:
```powershell
scoop install ffmpeg
```

## FFmpeg Olmadan Çalışma

FFmpeg yüklü değilse, sistem çalışmaya devam eder ancak:
- Backend'de otomatik video thumbnail'ları oluşturulmaz
- Frontend'de Canvas API ile thumbnail oluşturulur (daha yavaş)
- Video önizlemeleri hala çalışır

## Test

FFmpeg'in yüklü olduğunu kontrol etmek için:
```powershell
ffmpeg -version
```

Eğer FFmpeg komutu bulunamazsa, PATH ayarlarını kontrol edin veya terminal'i yeniden başlatın.

