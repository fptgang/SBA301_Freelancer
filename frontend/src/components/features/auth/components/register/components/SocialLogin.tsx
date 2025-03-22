import React, {useEffect, useRef} from 'react';
import { Button, Divider, Typography } from 'antd';
import { AppleOutlined, GoogleOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';
import {parseJwt} from "../../../../../../utils";

interface SocialLoginProps {
  providers?: Array<{
    name: string;
    label: string;
    icon: React.ReactNode;
  }>;
  callback?: ({
                provider,
                credential
              }: {
    provider: string;
    credential: string;
  }) => void;
}

const GOOGLE_CLIENT_ID =
  "456982582712-hhilqsfqccnkfvrc8mnqkcf0klchmesm.apps.googleusercontent.com";

export const SocialLogin: React.FC<SocialLoginProps> = ({ 
  providers, 
  callback
}) => {
  const translate = useTranslate();

  const GoogleButton = (): JSX.Element => {
    const divRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (typeof window === "undefined" || !window.google || !divRef.current) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          ux_mode: "popup",
          client_id: GOOGLE_CLIENT_ID,
          callback: async (res: CredentialResponse) => {
            if (res.credential && callback) {
              callback({
                provider: "google",
                credential: res.credential
              })
            }
          },
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: "filled_blue",
          size: "large",
          type: "standard",
        });
      } catch (error) {
        console.log(error);
      }
    }, [GOOGLE_CLIENT_ID, window.google, divRef.current]);

    return <div ref={divRef} id="login-with-google-button" />;
  };
  
  if (!providers || providers.length === 0) {
    // Default social buttons if no providers specified
    return (
      <div className="w-full max-w-xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          {/*<Button*/}
          {/*  className="flex items-center justify-center px-4 py-2 border border-black rounded-lg hover:bg-gray-200"*/}
          {/*  icon={<AppleOutlined />}*/}
          {/*  style={{*/}
          {/*    color: "black",*/}
          {/*    backgroundColor: "white",*/}
          {/*    fontSize: "16px",*/}
          {/*    height: "44px",*/}
          {/*    transition: "background-color 0.3s",*/}
          {/*  }}*/}
          {/*  onClick={() => handleProviderClick('apple')}*/}
          {/*>*/}
          {/*  Continue with Apple*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  className="flex items-center justify-center px-4 py-2 rounded-lg hover:bg-blue-600"*/}
          {/*  icon={<GoogleOutlined />}*/}
          {/*  style={{*/}
          {/*    color: "white",*/}
          {/*    backgroundColor: "#4285F4",*/}
          {/*    fontSize: "16px",*/}
          {/*    height: "44px",*/}
          {/*    transition: "background-color 0.3s",*/}
          {/*  }}*/}
          {/*  onClick={() => handleProviderClick('google')}*/}
          {/*>*/}
          {/*  Continue with Google*/}
          {/*</Button>*/}
          <GoogleButton />
        </div>
        <div className="flex items-center w-full">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">
            {translate("pages.register.divider", "or")}
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
      </div>
    );
  }
  
  // Use provided social login providers
  return (
    <div className="w-full max-w-xl">
      {providers.map((provider) => (
        <Button
          key={provider.name}
          type="default"
          block
          icon={provider.icon}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginBottom: "8px",
            height: "44px",
          }}
          onClick={() => handleProviderClick(provider.name)}
        >
          {provider.label}
        </Button>
      ))}
      <Divider>
        <Typography.Text type="secondary">
          {translate("pages.register.divider", "or")}
        </Typography.Text>
      </Divider>
    </div>  
  );
};