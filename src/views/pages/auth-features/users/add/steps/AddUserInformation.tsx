import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { Mail, Phone, UserRound } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function AddUserInformation() {
  const { t } = useTranslation();
  const { userData, setUserData, error } = useContext(StepperContext);
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  return (
    <div className="flex flex-col mt-10 w-full lg:w-[60%] 2xl:w-1/3 gap-y-6 pb-12">
      <CustomInput
        required={true}
        label={t("full_name")}
        requiredHint={`* ${t("required")}`}
        size_="sm"
        name="full_name"
        defaultValue={userData["full_name"]}
        placeholder={t("enter_your_name")}
        type="text"
        errorMessage={error.get("full_name")}
        onBlur={handleChange}
        startContent={
          <UserRound className="text-tertiary size-[18px] pointer-events-none" />
        }
      />
      <CustomInput
        required={true}
        requiredHint={`* ${t("required")}`}
        size_="sm"
        label={t("username")}
        name="username"
        defaultValue={userData["username"]}
        placeholder={t("enter_user_name")}
        type="text"
        errorMessage={error.get("username")}
        onBlur={handleChange}
        startContent={
          <UserRound className="text-tertiary size-[18px] pointer-events-none" />
        }
      />
      <CustomInput
        size_="sm"
        name="email"
        required={true}
        label={t("email")}
        requiredHint={`* ${t("required")}`}
        defaultValue={userData["email"]}
        placeholder={t("enter_your_email")}
        type="email"
        errorMessage={error.get("email")}
        onChange={handleChange}
        dir="ltr"
        className="rtl:text-right"
        startContent={
          <Mail className="text-tertiary size-[18px] pointer-events-none" />
        }
      />
      <CustomInput
        size_="sm"
        dir="ltr"
        className="rtl:text-end"
        label={t("contact")}
        placeholder={t("enter_ur_pho_num")}
        defaultValue={userData["contact"]}
        type="text"
        name="contact"
        errorMessage={error.get("contact")}
        onChange={handleChange}
        startContent={
          <Phone className="text-tertiary size-[18px] pointer-events-none" />
        }
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData({ ...userData, ["destination"]: selection })
        }
        lable={t("destination")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["destination"]?.name}
        placeHolder={t("select_destination")}
        errorMessage={error.get("destination")}
        apiUrl={"destinations"}
        mode="single"
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        required={true}
        requiredHint={`* ${t("required")}`}
        onSelect={(selection: any) =>
          setUserData({ ...userData, ["job"]: selection })
        }
        lable={t("job")}
        selectedItem={userData["job"]?.name}
        placeHolder={t("select_a_job")}
        errorMessage={error.get("job")}
        apiUrl={"jobs"}
        mode="single"
      />
    </div>
  );
}
