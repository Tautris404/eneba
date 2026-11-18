package email

import (
	"bytes"
	"context"
	"embed"
	"errors"
	"html/template"
	netmail "net/mail"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/wneessen/go-mail"
)

var (
	errSMTPHost     = errors.New("configure SMTP_HOST")
	errSMTPPort     = errors.New("configure a valid SMTP_PORT")
	errSMTPFrom     = errors.New("configure a valid email address in SMTP_FROM")
	errSMTPUser     = errors.New("configure SMTP_USER when SMTP_PASSWORD is set")
	errSMTPPassword = errors.New("configure SMTP_PASSWORD when SMTP_USER is set")
)

//go:embed templates/*.html
var templates embed.FS

//go:embed layout/layout.css
var layoutCSS string

//go:embed layout/layout.html
var layoutHTML string

type Sender struct {
	client *mail.Client
	from   string
	images map[string][]byte
	layout *template.Template
}

type smtpConfig struct {
	host     string
	port     int
	from     string
	username string
	password string
}

func NewSender() (*Sender, error) {
	config, err := loadSMTPConfig()
	if err != nil {
		return nil, err
	}
	client, err := newSMTPClient(config)
	if err != nil {
		return nil, err
	}
	layout, err := template.New("layout").Parse(
		strings.Replace(layoutHTML, "</head>", "<style>\n"+layoutCSS+"\n</style>\n</head>", 1),
	)
	if err != nil {
		return nil, err
	}
	images, err := loadImages()
	if err != nil {
		return nil, err
	}
	return &Sender{client: client, from: config.from, images: images, layout: layout}, nil
}

func loadImages() (map[string][]byte, error) {
	files := map[string]string{
		"eneba-header": "eneba-email-logo-white", "eneba-logo": "eneba-email-logo",
		"facebook": "email-facebook", "twitter": "email-twitter", "instagram": "email-instagram",
		"discord": "email-discord", "reddit": "email-reddit",
	}
	images := make(map[string][]byte, len(files))
	for id, file := range files {
		image, err := os.ReadFile("uploads/email/" + file + ".png")
		if err != nil {
			return nil, err
		}
		images[id] = image
	}
	return images, nil
}

func (s *Sender) Send(ctx context.Context, recipient, subject, templateName string, data any) error {
	message, err := s.message(recipient, subject, templateName, data)
	if err != nil {
		return err
	}
	return s.client.DialAndSendWithContext(ctx, message)
}

func loadSMTPConfig() (smtpConfig, error) {
	host := os.Getenv("SMTP_HOST")
	if strings.TrimSpace(host) == "" {
		return smtpConfig{}, errSMTPHost
	}
	port, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil || port < 1 || port > 65535 {
		return smtpConfig{}, errSMTPPort
	}
	username, password := os.Getenv("SMTP_USER"), os.Getenv("SMTP_PASSWORD")
	if username == "" && password != "" {
		return smtpConfig{}, errSMTPUser
	}
	if username != "" && password == "" {
		return smtpConfig{}, errSMTPPassword
	}
	from := os.Getenv("SMTP_FROM")
	if _, err := netmail.ParseAddress(from); err != nil {
		return smtpConfig{}, errSMTPFrom
	}
	return smtpConfig{host: host, port: port, from: from, username: username, password: password}, nil
}

func newSMTPClient(config smtpConfig) (*mail.Client, error) {
	options := []mail.Option{
		mail.WithPort(config.port),
		mail.WithTimeout(10 * time.Second),
	}
	if config.port == 465 {
		options = append(options, mail.WithSSL())
	}
	if config.username != "" {
		options = append(options, mail.WithSMTPAuth(mail.SMTPAuthPlain),
			mail.WithUsername(config.username), mail.WithPassword(config.password))
	}
	return mail.NewClient(config.host, options...)
}

func (s *Sender) message(recipient, subject, templateName string, data any) (*mail.Msg, error) {
	layout, err := s.layout.Clone()
	if err != nil {
		return nil, err
	}
	if _, err := layout.ParseFS(templates, "templates/"+templateName+".html"); err != nil {
		return nil, err
	}

	message := mail.NewMsg()
	if err := message.From(s.from); err != nil {
		return nil, err
	}
	if err := message.To(recipient); err != nil {
		return nil, err
	}
	message.Subject(subject)
	layoutData := struct {
		Subject string
		Year    int
		Data    any
	}{Subject: subject, Year: time.Now().Year(), Data: data}
	if err := message.SetBodyHTMLTemplate(layout, layoutData); err != nil {
		return nil, err
	}
	for id, image := range s.images {
		err := message.EmbedReader(
			id+".png",
			bytes.NewReader(image),
			mail.WithFileContentID("<"+id+">"),
		)
		if err != nil {
			return nil, err
		}
	}
	return message, nil
}
