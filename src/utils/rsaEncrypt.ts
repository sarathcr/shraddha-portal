import JSEncrypt from 'jsencrypt'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAndbX3iDQWXw+yFVSNrgU
+ONjMGn0iASKXcpw9AvGFdgb7kxGb+D15e4l5tK0nNEpJ/VuAR4qNnD+Cil39csT
ZUOusnK683i7IE2durzlZtYyztaFRL9EQo0EImpqJUUDi2G/vciXmCOE2MxgAy+N
8jjnh3kA8SfIUlpQ4S3MnmNNiRhjqSRqKDslikJQ+3wWj3Lonac99lH2H/gZmRz1
FZ3B0b/NajtWt6+YRely5ghr99fRPZE4k1k4l4fWbEcLREC+c5ti/5ddgjPBDKII
7UHZj60qNUoX82zw+ddoQfn+bnVm6iNqX1f81BIrS/VW56UWi/gplVL3oBSmwHGI
ZQIDAQAB
-----END PUBLIC KEY-----`

export function encryptWithRSA(text: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  return encryptor.encrypt(text)
}
