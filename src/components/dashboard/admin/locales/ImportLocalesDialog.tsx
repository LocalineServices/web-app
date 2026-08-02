"use client"

import { importLocales } from "@/actions/locales"
import { useSession } from "@/components/session-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { getFlagCodeForLocale } from "@/lib/project-utils"
import { AlertTriangleIcon, ImportIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

type ImportableLocaleProps = {
  language: string
  region?: string
  code: string
}

const IMPORTABLE_LOCALES: ImportableLocaleProps[] = [
  { language: "Afrikaans", code: "af" },
  { language: "Afrikaans", region: "Namibia", code: "af_NA" },
  { language: "Afrikaans", region: "South Africa", code: "af_ZA" },
  { language: "Akan", code: "ak" },
  { language: "Akan", region: "Ghana", code: "ak_GH" },
  { language: "Albanian", code: "sq" },
  { language: "Albanian", region: "Albania", code: "sq_AL" },
  { language: "Albanian", region: "Kosovo", code: "sq_XK" },
  { language: "Albanian", region: "Macedonia", code: "sq_MK" },
  { language: "Amharic", code: "am" },
  { language: "Amharic", region: "Ethiopia", code: "am_ET" },
  { language: "Arabic", code: "ar" },
  { language: "Arabic", region: "Algeria", code: "ar_DZ" },
  { language: "Arabic", region: "Bahrain", code: "ar_BH" },
  { language: "Arabic", region: "Chad", code: "ar_TD" },
  { language: "Arabic", region: "Comoros", code: "ar_KM" },
  { language: "Arabic", region: "Djibouti", code: "ar_DJ" },
  { language: "Arabic", region: "Egypt", code: "ar_EG" },
  { language: "Arabic", region: "Eritrea", code: "ar_ER" },
  { language: "Arabic", region: "Iraq", code: "ar_IQ" },
  { language: "Arabic", region: "Israel", code: "ar_IL" },
  { language: "Arabic", region: "Jordan", code: "ar_JO" },
  { language: "Arabic", region: "Kuwait", code: "ar_KW" },
  { language: "Arabic", region: "Lebanon", code: "ar_LB" },
  { language: "Arabic", region: "Libya", code: "ar_LY" },
  { language: "Arabic", region: "Mauritania", code: "ar_MR" },
  { language: "Arabic", region: "Morocco", code: "ar_MA" },
  { language: "Arabic", region: "Oman", code: "ar_OM" },
  { language: "Arabic", region: "Palestinian Territories", code: "ar_PS" },
  { language: "Arabic", region: "Qatar", code: "ar_QA" },
  { language: "Arabic", region: "Saudi Arabia", code: "ar_SA" },
  { language: "Arabic", region: "Somalia", code: "ar_SO" },
  { language: "Arabic", region: "South Sudan", code: "ar_SS" },
  { language: "Arabic", region: "Sudan", code: "ar_SD" },
  { language: "Arabic", region: "Syria", code: "ar_SY" },
  { language: "Arabic", region: "Tunisia", code: "ar_TN" },
  { language: "Arabic", region: "United Arab Emirates", code: "ar_AE" },
  { language: "Arabic", region: "Western Sahara", code: "ar_EH" },
  { language: "Arabic", region: "Yemen", code: "ar_YE" },
  { language: "Armenian", code: "hy" },
  { language: "Armenian", region: "Armenia", code: "hy_AM" },
  { language: "Assamese", code: "as" },
  { language: "Assamese", region: "India", code: "as_IN" },
  { language: "Azerbaijani", code: "az" },
  { language: "Azerbaijani", region: "Azerbaijan", code: "az_AZ" },
  {
    language: "Azerbaijani",
    region: "Cyrillic, Azerbaijan",
    code: "az_Cyrl_AZ",
  },
  { language: "Azerbaijani", region: "Cyrillic", code: "az_Cyrl" },
  { language: "Azerbaijani", region: "Latin, Azerbaijan", code: "az_Latn_AZ" },
  { language: "Azerbaijani", region: "Latin", code: "az_Latn" },
  { language: "Bambara", code: "bm" },
  { language: "Bambara", region: "Latin, Mali", code: "bm_Latn_ML" },
  { language: "Bambara", region: "Latin", code: "bm_Latn" },
  { language: "Basque", code: "eu" },
  { language: "Basque", region: "Spain", code: "eu_ES" },
  { language: "Belarusian", code: "be" },
  { language: "Belarusian", region: "Belarus", code: "be_BY" },
  { language: "Bengali", code: "bn" },
  { language: "Bengali", region: "Bangladesh", code: "bn_BD" },
  { language: "Bengali", region: "India", code: "bn_IN" },
  { language: "Bosnian", code: "bs" },
  { language: "Bosnian", region: "Bosnia & Herzegovina", code: "bs_BA" },
  {
    language: "Bosnian",
    region: "Cyrillic, Bosnia & Herzegovina",
    code: "bs_Cyrl_BA",
  },
  { language: "Bosnian", region: "Cyrillic", code: "bs_Cyrl" },
  {
    language: "Bosnian",
    region: "Latin, Bosnia & Herzegovina",
    code: "bs_Latn_BA",
  },
  { language: "Bosnian", region: "Latin", code: "bs_Latn" },
  { language: "Breton", code: "br" },
  { language: "Breton", region: "France", code: "br_FR" },
  { language: "Bulgarian", code: "bg" },
  { language: "Bulgarian", region: "Bulgaria", code: "bg_BG" },
  { language: "Burmese", code: "my" },
  { language: "Burmese", region: "Myanmar (Burma)", code: "my_MM" },
  { language: "Catalan", code: "ca" },
  { language: "Catalan", region: "Andorra", code: "ca_AD" },
  { language: "Catalan", region: "France", code: "ca_FR" },
  { language: "Catalan", region: "Italy", code: "ca_IT" },
  { language: "Catalan", region: "Spain", code: "ca_ES" },
  { language: "Chinese", code: "zh" },
  { language: "Chinese", region: "China", code: "zh_CN" },
  { language: "Chinese", region: "Hong Kong SAR China", code: "zh_HK" },
  { language: "Chinese", region: "Macau SAR China", code: "zh_MO" },
  { language: "Chinese", region: "Simplified, China", code: "zh_Hans_CN" },
  {
    language: "Chinese",
    region: "Simplified, Hong Kong SAR China",
    code: "zh_Hans_HK",
  },
  {
    language: "Chinese",
    region: "Simplified, Macau SAR China",
    code: "zh_Hans_MO",
  },
  { language: "Chinese", region: "Simplified, Singapore", code: "zh_Hans_SG" },
  { language: "Chinese", region: "Simplified", code: "zh_Hans" },
  { language: "Chinese", region: "Singapore", code: "zh_SG" },
  { language: "Chinese", region: "Taiwan", code: "zh_TW" },
  {
    language: "Chinese",
    region: "Traditional, Hong Kong SAR China",
    code: "zh_Hant_HK",
  },
  {
    language: "Chinese",
    region: "Traditional, Macau SAR China",
    code: "zh_Hant_MO",
  },
  { language: "Chinese", region: "Traditional, Taiwan", code: "zh_Hant_TW" },
  { language: "Chinese", region: "Traditional", code: "zh_Hant" },
  { language: "Cornish", code: "kw" },
  { language: "Cornish", region: "United Kingdom", code: "kw_GB" },
  { language: "Croatian", code: "hr" },
  { language: "Croatian", region: "Bosnia & Herzegovina", code: "hr_BA" },
  { language: "Croatian", region: "Croatia", code: "hr_HR" },
  { language: "Czech", code: "cs" },
  { language: "Czech", region: "Czech Republic", code: "cs_CZ" },
  { language: "Danish", code: "da" },
  { language: "Danish", region: "Denmark", code: "da_DK" },
  { language: "Danish", region: "Greenland", code: "da_GL" },
  { language: "Dutch", code: "nl" },
  { language: "Dutch", region: "Aruba", code: "nl_AW" },
  { language: "Dutch", region: "Belgium", code: "nl_BE" },
  { language: "Dutch", region: "Caribbean Netherlands", code: "nl_BQ" },
  { language: "Dutch", region: "Curaçao", code: "nl_CW" },
  { language: "Dutch", region: "Netherlands", code: "nl_NL" },
  { language: "Dutch", region: "Sint Maarten", code: "nl_SX" },
  { language: "Dutch", region: "Suriname", code: "nl_SR" },
  { language: "Dzongkha", code: "dz" },
  { language: "Dzongkha", region: "Bhutan", code: "dz_BT" },
  { language: "English", code: "en" },
  { language: "English", region: "American Samoa", code: "en_AS" },
  { language: "English", region: "Anguilla", code: "en_AI" },
  { language: "English", region: "Antigua & Barbuda", code: "en_AG" },
  { language: "English", region: "Australia", code: "en_AU" },
  { language: "English", region: "Bahamas", code: "en_BS" },
  { language: "English", region: "Barbados", code: "en_BB" },
  { language: "English", region: "Belgium", code: "en_BE" },
  { language: "English", region: "Belize", code: "en_BZ" },
  { language: "English", region: "Bermuda", code: "en_BM" },
  { language: "English", region: "Botswana", code: "en_BW" },
  {
    language: "English",
    region: "British Indian Ocean Territory",
    code: "en_IO",
  },
  { language: "English", region: "British Virgin Islands", code: "en_VG" },
  { language: "English", region: "Cameroon", code: "en_CM" },
  { language: "English", region: "Canada", code: "en_CA" },
  { language: "English", region: "Cayman Islands", code: "en_KY" },
  { language: "English", region: "Christmas Island", code: "en_CX" },
  { language: "English", region: "Cocos (Keeling) Islands", code: "en_CC" },
  { language: "English", region: "Cook Islands", code: "en_CK" },
  { language: "English", region: "Diego Garcia", code: "en_DG" },
  { language: "English", region: "Dominica", code: "en_DM" },
  { language: "English", region: "Eritrea", code: "en_ER" },
  { language: "English", region: "Falkland Islands", code: "en_FK" },
  { language: "English", region: "Fiji", code: "en_FJ" },
  { language: "English", region: "Gambia", code: "en_GM" },
  { language: "English", region: "Ghana", code: "en_GH" },
  { language: "English", region: "Gibraltar", code: "en_GI" },
  { language: "English", region: "Grenada", code: "en_GD" },
  { language: "English", region: "Guam", code: "en_GU" },
  { language: "English", region: "Guernsey", code: "en_GG" },
  { language: "English", region: "Guyana", code: "en_GY" },
  { language: "English", region: "Hong Kong SAR China", code: "en_HK" },
  { language: "English", region: "India", code: "en_IN" },
  { language: "English", region: "Ireland", code: "en_IE" },
  { language: "English", region: "Isle of Man", code: "en_IM" },
  { language: "English", region: "Jamaica", code: "en_JM" },
  { language: "English", region: "Jersey", code: "en_JE" },
  { language: "English", region: "Kenya", code: "en_KE" },
  { language: "English", region: "Kiribati", code: "en_KI" },
  { language: "English", region: "Lesotho", code: "en_LS" },
  { language: "English", region: "Liberia", code: "en_LR" },
  { language: "English", region: "Macau SAR China", code: "en_MO" },
  { language: "English", region: "Madagascar", code: "en_MG" },
  { language: "English", region: "Malawi", code: "en_MW" },
  { language: "English", region: "Malaysia", code: "en_MY" },
  { language: "English", region: "Malta", code: "en_MT" },
  { language: "English", region: "Marshall Islands", code: "en_MH" },
  { language: "English", region: "Mauritius", code: "en_MU" },
  { language: "English", region: "Micronesia", code: "en_FM" },
  { language: "English", region: "Montserrat", code: "en_MS" },
  { language: "English", region: "Namibia", code: "en_NA" },
  { language: "English", region: "Nauru", code: "en_NR" },
  { language: "English", region: "New Zealand", code: "en_NZ" },
  { language: "English", region: "Nigeria", code: "en_NG" },
  { language: "English", region: "Niue", code: "en_NU" },
  { language: "English", region: "Norfolk Island", code: "en_NF" },
  { language: "English", region: "Northern Mariana Islands", code: "en_MP" },
  { language: "English", region: "Pakistan", code: "en_PK" },
  { language: "English", region: "Palau", code: "en_PW" },
  { language: "English", region: "Papua New Guinea", code: "en_PG" },
  { language: "English", region: "Philippines", code: "en_PH" },
  { language: "English", region: "Pitcairn Islands", code: "en_PN" },
  { language: "English", region: "Puerto Rico", code: "en_PR" },
  { language: "English", region: "Rwanda", code: "en_RW" },
  { language: "English", region: "Samoa", code: "en_WS" },
  { language: "English", region: "Seychelles", code: "en_SC" },
  { language: "English", region: "Sierra Leone", code: "en_SL" },
  { language: "English", region: "Singapore", code: "en_SG" },
  { language: "English", region: "Sint Maarten", code: "en_SX" },
  { language: "English", region: "Solomon Islands", code: "en_SB" },
  { language: "English", region: "South Africa", code: "en_ZA" },
  { language: "English", region: "South Sudan", code: "en_SS" },
  { language: "English", region: "St. Helena", code: "en_SH" },
  { language: "English", region: "St. Kitts & Nevis", code: "en_KN" },
  { language: "English", region: "St. Lucia", code: "en_LC" },
  { language: "English", region: "St. Vincent & Grenadines", code: "en_VC" },
  { language: "English", region: "Sudan", code: "en_SD" },
  { language: "English", region: "Swaziland", code: "en_SZ" },
  { language: "English", region: "Tanzania", code: "en_TZ" },
  { language: "English", region: "Tokelau", code: "en_TK" },
  { language: "English", region: "Tonga", code: "en_TO" },
  { language: "English", region: "Trinidad & Tobago", code: "en_TT" },
  { language: "English", region: "Turks & Caicos Islands", code: "en_TC" },
  { language: "English", region: "Tuvalu", code: "en_TV" },
  { language: "English", region: "U.S. Outlying Islands", code: "en_UM" },
  { language: "English", region: "U.S. Virgin Islands", code: "en_VI" },
  { language: "English", region: "Uganda", code: "en_UG" },
  { language: "English", region: "United Kingdom", code: "en_GB" },
  { language: "English", region: "United States", code: "en_US" },
  { language: "English", region: "Vanuatu", code: "en_VU" },
  { language: "English", region: "Zambia", code: "en_ZM" },
  { language: "English", region: "Zimbabwe", code: "en_ZW" },
  { language: "Esperanto", code: "eo" },
  { language: "Estonian", code: "et" },
  { language: "Estonian", region: "Estonia", code: "et_EE" },
  { language: "Ewe", code: "ee" },
  { language: "Ewe", region: "Ghana", code: "ee_GH" },
  { language: "Ewe", region: "Togo", code: "ee_TG" },
  { language: "Faroese", code: "fo" },
  { language: "Faroese", region: "Faroe Islands", code: "fo_FO" },
  { language: "Finnish", code: "fi" },
  { language: "Finnish", region: "Finland", code: "fi_FI" },
  { language: "French", code: "fr" },
  { language: "French", region: "Algeria", code: "fr_DZ" },
  { language: "French", region: "Belgium", code: "fr_BE" },
  { language: "French", region: "Benin", code: "fr_BJ" },
  { language: "French", region: "Burkina Faso", code: "fr_BF" },
  { language: "French", region: "Burundi", code: "fr_BI" },
  { language: "French", region: "Cameroon", code: "fr_CM" },
  { language: "French", region: "Canada", code: "fr_CA" },
  { language: "French", region: "Central African Republic", code: "fr_CF" },
  { language: "French", region: "Chad", code: "fr_TD" },
  { language: "French", region: "Comoros", code: "fr_KM" },
  { language: "French", region: "Congo - Brazzaville", code: "fr_CG" },
  { language: "French", region: "Congo - Kinshasa", code: "fr_CD" },
  { language: "French", region: "Côte d’Ivoire", code: "fr_CI" },
  { language: "French", region: "Djibouti", code: "fr_DJ" },
  { language: "French", region: "Equatorial Guinea", code: "fr_GQ" },
  { language: "French", region: "France", code: "fr_FR" },
  { language: "French", region: "French Guiana", code: "fr_GF" },
  { language: "French", region: "French Polynesia", code: "fr_PF" },
  { language: "French", region: "Gabon", code: "fr_GA" },
  { language: "French", region: "Guadeloupe", code: "fr_GP" },
  { language: "French", region: "Guinea", code: "fr_GN" },
  { language: "French", region: "Haiti", code: "fr_HT" },
  { language: "French", region: "Luxembourg", code: "fr_LU" },
  { language: "French", region: "Madagascar", code: "fr_MG" },
  { language: "French", region: "Mali", code: "fr_ML" },
  { language: "French", region: "Martinique", code: "fr_MQ" },
  { language: "French", region: "Mauritania", code: "fr_MR" },
  { language: "French", region: "Mauritius", code: "fr_MU" },
  { language: "French", region: "Mayotte", code: "fr_YT" },
  { language: "French", region: "Monaco", code: "fr_MC" },
  { language: "French", region: "Morocco", code: "fr_MA" },
  { language: "French", region: "New Caledonia", code: "fr_NC" },
  { language: "French", region: "Niger", code: "fr_NE" },
  { language: "French", region: "Réunion", code: "fr_RE" },
  { language: "French", region: "Rwanda", code: "fr_RW" },
  { language: "French", region: "Senegal", code: "fr_SN" },
  { language: "French", region: "Seychelles", code: "fr_SC" },
  { language: "French", region: "St. Barthélemy", code: "fr_BL" },
  { language: "French", region: "St. Martin", code: "fr_MF" },
  { language: "French", region: "St. Pierre & Miquelon", code: "fr_PM" },
  { language: "French", region: "Switzerland", code: "fr_CH" },
  { language: "French", region: "Syria", code: "fr_SY" },
  { language: "French", region: "Togo", code: "fr_TG" },
  { language: "French", region: "Tunisia", code: "fr_TN" },
  { language: "French", region: "Vanuatu", code: "fr_VU" },
  { language: "French", region: "Wallis & Futuna", code: "fr_WF" },
  { language: "Fulah", code: "ff" },
  { language: "Fulah", region: "Cameroon", code: "ff_CM" },
  { language: "Fulah", region: "Guinea", code: "ff_GN" },
  { language: "Fulah", region: "Mauritania", code: "ff_MR" },
  { language: "Fulah", region: "Senegal", code: "ff_SN" },
  { language: "Galician", code: "gl" },
  { language: "Galician", region: "Spain", code: "gl_ES" },
  { language: "Ganda", code: "lg" },
  { language: "Ganda", region: "Uganda", code: "lg_UG" },
  { language: "Georgian", code: "ka" },
  { language: "Georgian", region: "Georgia", code: "ka_GE" },
  { language: "German", code: "de" },
  { language: "German", region: "Austria", code: "de_AT" },
  { language: "German", region: "Belgium", code: "de_BE" },
  { language: "German", region: "Germany", code: "de_DE" },
  { language: "German", region: "Liechtenstein", code: "de_LI" },
  { language: "German", region: "Luxembourg", code: "de_LU" },
  { language: "German", region: "Switzerland", code: "de_CH" },
  { language: "Greek", code: "el" },
  { language: "Greek", region: "Cyprus", code: "el_CY" },
  { language: "Greek", region: "Greece", code: "el_GR" },
  { language: "Gujarati", code: "gu" },
  { language: "Gujarati", region: "India", code: "gu_IN" },
  { language: "Hausa", code: "ha" },
  { language: "Hausa", region: "Ghana", code: "ha_GH" },
  { language: "Hausa", region: "Latin, Ghana", code: "ha_Latn_GH" },
  { language: "Hausa", region: "Latin, Niger", code: "ha_Latn_NE" },
  { language: "Hausa", region: "Latin, Nigeria", code: "ha_Latn_NG" },
  { language: "Hausa", region: "Latin", code: "ha_Latn" },
  { language: "Hausa", region: "Niger", code: "ha_NE" },
  { language: "Hausa", region: "Nigeria", code: "ha_NG" },
  { language: "Hebrew", code: "he" },
  { language: "Hebrew", region: "Israel", code: "he_IL" },
  { language: "Hindi", code: "hi" },
  { language: "Hindi", region: "India", code: "hi_IN" },
  { language: "Hungarian", code: "hu" },
  { language: "Hungarian", region: "Hungary", code: "hu_HU" },
  { language: "Icelandic", code: "is" },
  { language: "Icelandic", region: "Iceland", code: "is_IS" },
  { language: "Igbo", code: "ig" },
  { language: "Igbo", region: "Nigeria", code: "ig_NG" },
  { language: "Indonesian", code: "id" },
  { language: "Indonesian", region: "Indonesia", code: "id_ID" },
  { language: "Irish", code: "ga" },
  { language: "Irish", region: "Ireland", code: "ga_IE" },
  { language: "Italian", code: "it" },
  { language: "Italian", region: "Italy", code: "it_IT" },
  { language: "Italian", region: "San Marino", code: "it_SM" },
  { language: "Italian", region: "Switzerland", code: "it_CH" },
  { language: "Japanese", code: "ja" },
  { language: "Japanese", region: "Japan", code: "ja_JP" },
  { language: "Kalaallisut", code: "kl" },
  { language: "Kalaallisut", region: "Greenland", code: "kl_GL" },
  { language: "Kannada", code: "kn" },
  { language: "Kannada", region: "India", code: "kn_IN" },
  { language: "Kashmiri", code: "ks" },
  { language: "Kashmiri", region: "Arabic, India", code: "ks_Arab_IN" },
  { language: "Kashmiri", region: "Arabic", code: "ks_Arab" },
  { language: "Kashmiri", region: "India", code: "ks_IN" },
  { language: "Kazakh", code: "kk" },
  { language: "Kazakh", region: "Cyrillic, Kazakhstan", code: "kk_Cyrl_KZ" },
  { language: "Kazakh", region: "Cyrillic", code: "kk_Cyrl" },
  { language: "Kazakh", region: "Kazakhstan", code: "kk_KZ" },
  { language: "Khmer", code: "km" },
  { language: "Khmer", region: "Cambodia", code: "km_KH" },
  { language: "Kikuyu", code: "ki" },
  { language: "Kikuyu", region: "Kenya", code: "ki_KE" },
  { language: "Kinyarwanda", code: "rw" },
  { language: "Kinyarwanda", region: "Rwanda", code: "rw_RW" },
  { language: "Korean", code: "ko" },
  { language: "Korean", region: "North Korea", code: "ko_KP" },
  { language: "Korean", region: "South Korea", code: "ko_KR" },
  { language: "Kyrgyz", code: "ky" },
  { language: "Kyrgyz", region: "Cyrillic, Kyrgyzstan", code: "ky_Cyrl_KG" },
  { language: "Kyrgyz", region: "Cyrillic", code: "ky_Cyrl" },
  { language: "Kyrgyz", region: "Kyrgyzstan", code: "ky_KG" },
  { language: "Lao", code: "lo" },
  { language: "Lao", region: "Laos", code: "lo_LA" },
  { language: "Latvian", code: "lv" },
  { language: "Latvian", region: "Latvia", code: "lv_LV" },
  { language: "Lingala", code: "ln" },
  { language: "Lingala", region: "Angola", code: "ln_AO" },
  { language: "Lingala", region: "Central African Republic", code: "ln_CF" },
  { language: "Lingala", region: "Congo - Brazzaville", code: "ln_CG" },
  { language: "Lingala", region: "Congo - Kinshasa", code: "ln_CD" },
  { language: "Lithuanian", code: "lt" },
  { language: "Lithuanian", region: "Lithuania", code: "lt_LT" },
  { language: "Luba-Katanga", code: "lu" },
  { language: "Luba-Katanga", region: "Congo - Kinshasa", code: "lu_CD" },
  { language: "Luxembourgish", code: "lb" },
  { language: "Luxembourgish", region: "Luxembourg", code: "lb_LU" },
  { language: "Macedonian", code: "mk" },
  { language: "Macedonian", region: "Macedonia", code: "mk_MK" },
  { language: "Malagasy", code: "mg" },
  { language: "Malagasy", region: "Madagascar", code: "mg_MG" },
  { language: "Malay", code: "ms" },
  { language: "Malay", region: "Brunei", code: "ms_BN" },
  { language: "Malay", region: "Latin, Brunei", code: "ms_Latn_BN" },
  { language: "Malay", region: "Latin, Malaysia", code: "ms_Latn_MY" },
  { language: "Malay", region: "Latin, Singapore", code: "ms_Latn_SG" },
  { language: "Malay", region: "Latin", code: "ms_Latn" },
  { language: "Malay", region: "Malaysia", code: "ms_MY" },
  { language: "Malay", region: "Singapore", code: "ms_SG" },
  { language: "Malayalam", code: "ml" },
  { language: "Malayalam", region: "India", code: "ml_IN" },
  { language: "Maltese", code: "mt" },
  { language: "Maltese", region: "Malta", code: "mt_MT" },
  { language: "Manx", code: "gv" },
  { language: "Manx", region: "Isle of Man", code: "gv_IM" },
  { language: "Marathi", code: "mr" },
  { language: "Marathi", region: "India", code: "mr_IN" },
  { language: "Mongolian", code: "mn" },
  { language: "Mongolian", region: "Cyrillic, Mongolia", code: "mn_Cyrl_MN" },
  { language: "Mongolian", region: "Cyrillic", code: "mn_Cyrl" },
  { language: "Mongolian", region: "Mongolia", code: "mn_MN" },
  { language: "Nepali", code: "ne" },
  { language: "Nepali", region: "India", code: "ne_IN" },
  { language: "Nepali", region: "Nepal", code: "ne_NP" },
  { language: "North Ndebele", code: "nd" },
  { language: "North Ndebele", region: "Zimbabwe", code: "nd_ZW" },
  { language: "Northern Sami", code: "se" },
  { language: "Northern Sami", region: "Finland", code: "se_FI" },
  { language: "Northern Sami", region: "Norway", code: "se_NO" },
  { language: "Northern Sami", region: "Sweden", code: "se_SE" },
  { language: "Norwegian", code: "no" },
  { language: "Norwegian", region: "Norway", code: "no_NO" },
  { language: "Norwegian Bokmål", code: "nb" },
  { language: "Norwegian Bokmål", region: "Norway", code: "nb_NO" },
  {
    language: "Norwegian Bokmål",
    region: "Svalbard & Jan Mayen",
    code: "nb_SJ",
  },
  { language: "Norwegian Nynorsk", code: "nn" },
  { language: "Norwegian Nynorsk", region: "Norway", code: "nn_NO" },
  { language: "Oriya", code: "or" },
  { language: "Oriya", region: "India", code: "or_IN" },
  { language: "Oromo", code: "om" },
  { language: "Oromo", region: "Ethiopia", code: "om_ET" },
  { language: "Oromo", region: "Kenya", code: "om_KE" },
  { language: "Ossetic", code: "os" },
  { language: "Ossetic", region: "Georgia", code: "os_GE" },
  { language: "Ossetic", region: "Russia", code: "os_RU" },
  { language: "Pashto", code: "ps" },
  { language: "Pashto", region: "Afghanistan", code: "ps_AF" },
  { language: "Persian", code: "fa" },
  { language: "Persian", region: "Afghanistan", code: "fa_AF" },
  { language: "Persian", region: "Iran", code: "fa_IR" },
  { language: "Polish", code: "pl" },
  { language: "Polish", region: "Poland", code: "pl_PL" },
  { language: "Portuguese", code: "pt" },
  { language: "Portuguese", region: "Angola", code: "pt_AO" },
  { language: "Portuguese", region: "Brazil", code: "pt_BR" },
  { language: "Portuguese", region: "Cape Verde", code: "pt_CV" },
  { language: "Portuguese", region: "Guinea-Bissau", code: "pt_GW" },
  { language: "Portuguese", region: "Macau SAR China", code: "pt_MO" },
  { language: "Portuguese", region: "Mozambique", code: "pt_MZ" },
  { language: "Portuguese", region: "Portugal", code: "pt_PT" },
  { language: "Portuguese", region: "São Tomé & Príncipe", code: "pt_ST" },
  { language: "Portuguese", region: "Timor-Leste", code: "pt_TL" },
  { language: "Punjabi", code: "pa" },
  { language: "Punjabi", region: "Arabic, Pakistan", code: "pa_Arab_PK" },
  { language: "Punjabi", region: "Arabic", code: "pa_Arab" },
  { language: "Punjabi", region: "Gurmukhi, India", code: "pa_Guru_IN" },
  { language: "Punjabi", region: "Gurmukhi", code: "pa_Guru" },
  { language: "Punjabi", region: "India", code: "pa_IN" },
  { language: "Punjabi", region: "Pakistan", code: "pa_PK" },
  { language: "Quechua", code: "qu" },
  { language: "Quechua", region: "Bolivia", code: "qu_BO" },
  { language: "Quechua", region: "Ecuador", code: "qu_EC" },
  { language: "Quechua", region: "Peru", code: "qu_PE" },
  { language: "Romanian", code: "ro" },
  { language: "Romanian", region: "Moldova", code: "ro_MD" },
  { language: "Romanian", region: "Romania", code: "ro_RO" },
  { language: "Romansh", code: "rm" },
  { language: "Romansh", region: "Switzerland", code: "rm_CH" },
  { language: "Rundi", code: "rn" },
  { language: "Rundi", region: "Burundi", code: "rn_BI" },
  { language: "Russian", code: "ru" },
  { language: "Russian", region: "Belarus", code: "ru_BY" },
  { language: "Russian", region: "Kazakhstan", code: "ru_KZ" },
  { language: "Russian", region: "Kyrgyzstan", code: "ru_KG" },
  { language: "Russian", region: "Moldova", code: "ru_MD" },
  { language: "Russian", region: "Russia", code: "ru_RU" },
  { language: "Russian", region: "Ukraine", code: "ru_UA" },
  { language: "Sango", code: "sg" },
  { language: "Sango", region: "Central African Republic", code: "sg_CF" },
  { language: "Scottish Gaelic", code: "gd" },
  { language: "Scottish Gaelic", region: "United Kingdom", code: "gd_GB" },
  { language: "Serbian", code: "sr" },
  { language: "Serbian", region: "Bosnia & Herzegovina", code: "sr_BA" },
  {
    language: "Serbian",
    region: "Cyrillic, Bosnia & Herzegovina",
    code: "sr_Cyrl_BA",
  },
  { language: "Serbian", region: "Cyrillic, Kosovo", code: "sr_Cyrl_XK" },
  { language: "Serbian", region: "Cyrillic, Montenegro", code: "sr_Cyrl_ME" },
  { language: "Serbian", region: "Cyrillic, Serbia", code: "sr_Cyrl_RS" },
  { language: "Serbian", region: "Cyrillic", code: "sr_Cyrl" },
  { language: "Serbian", region: "Kosovo", code: "sr_XK" },
  {
    language: "Serbian",
    region: "Latin, Bosnia & Herzegovina",
    code: "sr_Latn_BA",
  },
  { language: "Serbian", region: "Latin, Kosovo", code: "sr_Latn_XK" },
  { language: "Serbian", region: "Latin, Montenegro", code: "sr_Latn_ME" },
  { language: "Serbian", region: "Latin, Serbia", code: "sr_Latn_RS" },
  { language: "Serbian", region: "Latin", code: "sr_Latn" },
  { language: "Serbian", region: "Montenegro", code: "sr_ME" },
  { language: "Serbian", region: "Serbia", code: "sr_RS" },
  { language: "Serbo-Croatian", code: "sh" },
  { language: "Serbo-Croatian", region: "Bosnia & Herzegovina", code: "sh_BA" },
  { language: "Shona", code: "sn" },
  { language: "Shona", region: "Zimbabwe", code: "sn_ZW" },
  { language: "Sichuan Yi", code: "ii" },
  { language: "Sichuan Yi", region: "China", code: "ii_CN" },
  { language: "Sinhala", code: "si" },
  { language: "Sinhala", region: "Sri Lanka", code: "si_LK" },
  { language: "Slovak", code: "sk" },
  { language: "Slovak", region: "Slovakia", code: "sk_SK" },
  { language: "Slovenian", code: "sl" },
  { language: "Slovenian", region: "Slovenia", code: "sl_SI" },
  { language: "Somali", code: "so" },
  { language: "Somali", region: "Djibouti", code: "so_DJ" },
  { language: "Somali", region: "Ethiopia", code: "so_ET" },
  { language: "Somali", region: "Kenya", code: "so_KE" },
  { language: "Somali", region: "Somalia", code: "so_SO" },
  { language: "Spanish", code: "es" },
  { language: "Spanish", region: "Argentina", code: "es_AR" },
  { language: "Spanish", region: "Bolivia", code: "es_BO" },
  { language: "Spanish", region: "Canary Islands", code: "es_IC" },
  { language: "Spanish", region: "Ceuta & Melilla", code: "es_EA" },
  { language: "Spanish", region: "Chile", code: "es_CL" },
  { language: "Spanish", region: "Colombia", code: "es_CO" },
  { language: "Spanish", region: "Costa Rica", code: "es_CR" },
  { language: "Spanish", region: "Cuba", code: "es_CU" },
  { language: "Spanish", region: "Dominican Republic", code: "es_DO" },
  { language: "Spanish", region: "Ecuador", code: "es_EC" },
  { language: "Spanish", region: "El Salvador", code: "es_SV" },
  { language: "Spanish", region: "Equatorial Guinea", code: "es_GQ" },
  { language: "Spanish", region: "Guatemala", code: "es_GT" },
  { language: "Spanish", region: "Honduras", code: "es_HN" },
  { language: "Spanish", region: "Mexico", code: "es_MX" },
  { language: "Spanish", region: "Nicaragua", code: "es_NI" },
  { language: "Spanish", region: "Panama", code: "es_PA" },
  { language: "Spanish", region: "Paraguay", code: "es_PY" },
  { language: "Spanish", region: "Peru", code: "es_PE" },
  { language: "Spanish", region: "Philippines", code: "es_PH" },
  { language: "Spanish", region: "Puerto Rico", code: "es_PR" },
  { language: "Spanish", region: "Spain", code: "es_ES" },
  { language: "Spanish", region: "United States", code: "es_US" },
  { language: "Spanish", region: "Uruguay", code: "es_UY" },
  { language: "Spanish", region: "Venezuela", code: "es_VE" },
  { language: "Swahili", code: "sw" },
  { language: "Swahili", region: "Kenya", code: "sw_KE" },
  { language: "Swahili", region: "Tanzania", code: "sw_TZ" },
  { language: "Swahili", region: "Uganda", code: "sw_UG" },
  { language: "Swedish", code: "sv" },
  { language: "Swedish", region: "Åland Islands", code: "sv_AX" },
  { language: "Swedish", region: "Finland", code: "sv_FI" },
  { language: "Swedish", region: "Sweden", code: "sv_SE" },
  { language: "Tagalog", code: "tl" },
  { language: "Tagalog", region: "Philippines", code: "tl_PH" },
  { language: "Tamil", code: "ta" },
  { language: "Tamil", region: "India", code: "ta_IN" },
  { language: "Tamil", region: "Malaysia", code: "ta_MY" },
  { language: "Tamil", region: "Singapore", code: "ta_SG" },
  { language: "Tamil", region: "Sri Lanka", code: "ta_LK" },
  { language: "Telugu", code: "te" },
  { language: "Telugu", region: "India", code: "te_IN" },
  { language: "Thai", code: "th" },
  { language: "Thai", region: "Thailand", code: "th_TH" },
  { language: "Tibetan", code: "bo" },
  { language: "Tibetan", region: "China", code: "bo_CN" },
  { language: "Tibetan", region: "India", code: "bo_IN" },
  { language: "Tigrinya", code: "ti" },
  { language: "Tigrinya", region: "Eritrea", code: "ti_ER" },
  { language: "Tigrinya", region: "Ethiopia", code: "ti_ET" },
  { language: "Tongan", code: "to" },
  { language: "Tongan", region: "Tonga", code: "to_TO" },
  { language: "Turkish", code: "tr" },
  { language: "Turkish", region: "Cyprus", code: "tr_CY" },
  { language: "Turkish", region: "Turkey", code: "tr_TR" },
  { language: "Ukrainian", code: "uk" },
  { language: "Ukrainian", region: "Ukraine", code: "uk_UA" },
  { language: "Urdu", code: "ur" },
  { language: "Urdu", region: "India", code: "ur_IN" },
  { language: "Urdu", region: "Pakistan", code: "ur_PK" },
  { language: "Uyghur", code: "ug" },
  { language: "Uyghur", region: "Arabic, China", code: "ug_Arab_CN" },
  { language: "Uyghur", region: "Arabic", code: "ug_Arab" },
  { language: "Uyghur", region: "China", code: "ug_CN" },
  { language: "Uzbek", code: "uz" },
  { language: "Uzbek", region: "Afghanistan", code: "uz_AF" },
  { language: "Uzbek", region: "Arabic, Afghanistan", code: "uz_Arab_AF" },
  { language: "Uzbek", region: "Arabic", code: "uz_Arab" },
  { language: "Uzbek", region: "Cyrillic, Uzbekistan", code: "uz_Cyrl_UZ" },
  { language: "Uzbek", region: "Cyrillic", code: "uz_Cyrl" },
  { language: "Uzbek", region: "Latin, Uzbekistan", code: "uz_Latn_UZ" },
  { language: "Uzbek", region: "Latin", code: "uz_Latn" },
  { language: "Uzbek", region: "Uzbekistan", code: "uz_UZ" },
  { language: "Vietnamese", code: "vi" },
  { language: "Vietnamese", region: "Vietnam", code: "vi_VN" },
  { language: "Welsh", code: "cy" },
  { language: "Welsh", region: "United Kingdom", code: "cy_GB" },
  { language: "Western Frisian", code: "fy" },
  { language: "Western Frisian", region: "Netherlands", code: "fy_NL" },
  { language: "Yiddish", code: "yi" },
  { language: "Yoruba", code: "yo" },
  { language: "Yoruba", region: "Benin", code: "yo_BJ" },
  { language: "Yoruba", region: "Nigeria", code: "yo_NG" },
  { language: "Zulu", code: "zu" },
  { language: "Zulu", region: "South Africa", code: "zu_ZA" },
]

type ImportableLocaleGroup = {
  language: string
  locales: ImportableLocaleProps[]
}

const IMPORTABLE_LOCALE_GROUPS = IMPORTABLE_LOCALES.reduce<
  ImportableLocaleGroup[]
>((groups, locale) => {
  const existingGroup = groups.find(
    (group) => group.language === locale.language
  )

  if (existingGroup) {
    existingGroup.locales.push(locale)
    return groups
  }

  groups.push({
    language: locale.language,
    locales: [locale],
  })

  return groups
}, [])

export default function ImportLocalesDialog() {
  const t = useTranslations("ImportLocalesDialog")

  const router = useRouter()
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedLocales, setSelectedLocales] = useState<
    ImportableLocaleProps[]
  >([])

  const canCreateLocales = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      locales: ["create"],
    },
  })

  const handleLocaleChange = (
    locale: ImportableLocaleProps,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedLocales((currentLocales) => {
      if (checked === true) {
        if (
          currentLocales.some(
            (currentLocale) => currentLocale.code === locale.code
          )
        ) {
          return currentLocales
        }

        return [...currentLocales, locale]
      }

      return currentLocales.filter(
        (currentLocale) => currentLocale.code !== locale.code
      )
    })
  }

  const handleImportLocales = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setLoading(true)
    try {
      const result = await importLocales(
        selectedLocales.map((locale) => ({
          displayName: `${locale.language}${locale.region ? ` (${locale.region})` : ""}`,
          language: locale.language,
          region: locale.region ?? null,
          code: locale.code,
          flag: getFlagCodeForLocale(locale) ?? null,
          enabled: true,
        }))
      )

      toast.success(
        t("toast.importSuccess", {
          total: result.total,
          created: result.created,
          updated: result.updated,
        })
      )
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("toast.importFailed")
      )
    } finally {
      setLoading(false)
      setDialogOpen(false)
      setSelectedLocales([])
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setSelectedLocales([])
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateLocales || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateLocales || loading}>
              <Button variant="outline" disabled={!canCreateLocales || loading}>
                <ImportIcon className="mr-2 h-4 w-4" />
                {t("button.importLocales")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateLocales && (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        )}
      </Tooltip>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:pr-12">
          <div className="space-y-1">
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>{t("dialog.description")}</DialogDescription>
          </div>

          <div className="flex gap-2 space-y-1">
            <Button
              variant="outline"
              onClick={() => setSelectedLocales(IMPORTABLE_LOCALES)}
              disabled={loading}
              size="sm"
              className="self-start"
            >
              {t("dialog.selectAll", { count: IMPORTABLE_LOCALES.length })}
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedLocales([])}
              disabled={loading}
              size="sm"
              className="self-start"
            >
              {t("dialog.deselectAll", { count: selectedLocales.length })}
            </Button>
          </div>
        </DialogHeader>

        {selectedLocales.length > 150 && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
            <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
            <AlertTitle>{t("alert.manyLocalesTitle")}</AlertTitle>
            <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
              {t("alert.manyLocalesDescription", {
                count: selectedLocales.length,
              })}
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          className="min-w-0"
          defaultValue={IMPORTABLE_LOCALE_GROUPS[0]?.language ?? ""}
        >
          <ScrollArea
            className="w-full max-w-full min-w-0 rounded-md border"
            scrollbarOrientation="horizontal"
          >
            <TabsList className="flex w-max flex-row flex-nowrap items-start gap-1 p-1">
              {IMPORTABLE_LOCALE_GROUPS.map((group) => (
                <TabsTrigger
                  key={group.language}
                  value={group.language}
                  className="px-3"
                >
                  {group.language}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <ScrollArea className="mt-4 max-h-100 w-full max-w-full min-w-0">
            {IMPORTABLE_LOCALE_GROUPS.map((group) => (
              <TabsContent key={group.language} value={group.language}>
                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {group.locales.map((locale) => (
                    <Field key={locale.code} orientation="horizontal">
                      <Checkbox
                        id={locale.code}
                        checked={selectedLocales.some(
                          (currentLocale) => currentLocale.code === locale.code
                        )}
                        onCheckedChange={(checked) =>
                          handleLocaleChange(locale, checked)
                        }
                        disabled={loading}
                      />
                      <Label
                        htmlFor={locale.code}
                      >{`${locale.language}${locale.region ? ` (${locale.region})` : ""}`}</Label>
                    </Field>
                  ))}
                </FieldGroup>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setSelectedLocales([])
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleImportLocales}
            disabled={loading || selectedLocales.length === 0}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.importingLocales")}
              </>
            ) : (
              <>
                <ImportIcon className="h-4 w-4" />
                {t("dialog.importLocales", { count: selectedLocales.length })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
